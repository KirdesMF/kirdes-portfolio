/* biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook. */
import { AnimationTheme, toUnitRgb } from "../../theme";
import {
	createWebGLProgram,
	requireWebGLBuffer,
	requireWebGLTexture,
	requireWebGLUniform,
	requireWebGLVertexArray,
} from "../helpers";

import { beadCurtainFragmentShader, beadCurtainVertexShader } from "./bead-curtain-shaders";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&%?";
const ATLAS_COLUMNS = 8;
const ATLAS_CELL_SIZE = 64;
const STRAND_SPACING = 24;
const BEAD_SPACING = 10;
const GLYPH_WIDTH = 11;
const GLYPH_HEIGHT = 13;
const POINTER_RADIUS = 92;
const MAX_DPR = 2;
const FIXED_STEP = 1 / 120;
const CONSTRAINT_ITERATIONS = 14;
const GRAVITY = 900;
const VERLET_DAMPING = 0.995;
const POINTER_FORCE = 8_000;
const POINTER_DRAG = 18;
const MAX_POINTER_SPEED = 2_400;
const MAX_SCRAMBLES_PER_FRAME = 3;
const SCRAMBLE_MIN_DELAY = 12_000;
const SCRAMBLE_MAX_DELAY = 35_000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const QUAD_VERTICES = new Float32Array([
	-0.5, -0.5, 0, 0, 0.5, -0.5, 1, 0, -0.5, 0.5, 0, 1, -0.5, 0.5, 0, 1, 0.5, -0.5, 1, 0, 0.5, 0.5, 1,
	1,
]);

type Uniforms = {
	resolution: WebGLUniformLocation;
	glyphSize: WebGLUniformLocation;
	atlasGrid: WebGLUniformLocation;
	atlas: WebGLUniformLocation;
	color: WebGLUniformLocation;
};

export class BeadCurtainRenderer {
	private readonly gl: WebGL2RenderingContext;
	private readonly program: WebGLProgram;
	private readonly vao: WebGLVertexArrayObject;
	private readonly quadBuffer: WebGLBuffer;
	private readonly positionBuffer: WebGLBuffer;
	private readonly glyphBuffer: WebGLBuffer;
	private readonly atlas: WebGLTexture;
	private readonly uniforms: Uniforms;
	private readonly abortController = new AbortController();
	private readonly theme: AnimationTheme;
	private readonly reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
	private readonly previousTouchAction: string;

	private positions = new Float32Array();
	private previousPositions = new Float32Array();
	private strandDirections = new Float32Array();
	private glyphIndices = new Float32Array();
	private nextScrambleAt = new Float64Array();
	private strandCount = 0;
	private beadsPerStrand = 0;
	private instanceCount = 0;
	private dpr = 1;
	private lastTimestamp = 0;
	private accumulator = 0;
	private atlasReady = false;
	private disposed = false;
	private reduceMotion = false;
	private pointerActive = false;
	private pointerX = -10_000;
	private pointerY = -10_000;
	private simulatedPointerX = -10_000;
	private simulatedPointerY = -10_000;

	constructor(private readonly canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: true,
			depth: false,
			stencil: false,
			powerPreference: "high-performance",
		});

		if (!gl) {
			throw new Error("WebGL2 is not supported in this browser.");
		}

		this.gl = gl;
		this.program = createWebGLProgram(gl, beadCurtainVertexShader, beadCurtainFragmentShader);
		this.vao = requireWebGLVertexArray(gl);
		this.quadBuffer = requireWebGLBuffer(gl);
		this.positionBuffer = requireWebGLBuffer(gl);
		this.glyphBuffer = requireWebGLBuffer(gl);
		this.atlas = requireWebGLTexture(gl);
		this.uniforms = {
			resolution: requireWebGLUniform(gl, this.program, "u_resolution"),
			glyphSize: requireWebGLUniform(gl, this.program, "u_glyphSize"),
			atlasGrid: requireWebGLUniform(gl, this.program, "u_atlasGrid"),
			atlas: requireWebGLUniform(gl, this.program, "u_atlas"),
			color: requireWebGLUniform(gl, this.program, "u_color"),
		};
		this.previousTouchAction = canvas.style.touchAction;
		this.reduceMotion = this.reducedMotionQuery.matches;
		this.theme = new AnimationTheme(canvas);

		this.configureGeometry();
		this.configureEmptyAtlas();
		this.bindEvents();
		void this.initializeAtlas();
	}

	resize(): void {
		const rect = this.canvas.getBoundingClientRect();
		const nextDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, MAX_DPR));
		const width = Math.max(1, Math.round(rect.width * nextDpr));
		const height = Math.max(1, Math.round(rect.height * nextDpr));

		if (this.canvas.width === width && this.canvas.height === height && this.dpr === nextDpr) {
			return;
		}

		this.dpr = nextDpr;
		this.canvas.width = width;
		this.canvas.height = height;
		this.gl.viewport(0, 0, width, height);
		this.rebuildCurtain(width, height);
		this.pointerActive = false;
		this.lastTimestamp = 0;
		this.accumulator = 0;
	}

	render(timestamp: number): void {
		const frameDelta =
			this.lastTimestamp === 0
				? FIXED_STEP
				: Math.min(0.05, Math.max(0, (timestamp - this.lastTimestamp) / 1000));
		this.lastTimestamp = timestamp;

		if (!this.reduceMotion) {
			this.updateScrambling(timestamp);
			this.accumulator += frameDelta;
			const stepCount = Math.floor(this.accumulator / FIXED_STEP);

			if (stepCount > 0) {
				const startPointerX = this.simulatedPointerX;
				const startPointerY = this.simulatedPointerY;
				const pointerStepX = (this.pointerX - startPointerX) / stepCount;
				const pointerStepY = (this.pointerY - startPointerY) / stepCount;

				for (let step = 1; step <= stepCount; step += 1) {
					this.simulate(
						FIXED_STEP,
						startPointerX + pointerStepX * step,
						startPointerY + pointerStepY * step,
						pointerStepX,
						pointerStepY,
					);
					this.accumulator -= FIXED_STEP;
				}

				this.simulatedPointerX = this.pointerX;
				this.simulatedPointerY = this.pointerY;
				this.uploadPositions();
			}
		}

		const gl = this.gl;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		const background = toUnitRgb(this.theme.palette.background);
		gl.clearColor(background[0], background[1], background[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		if (!this.atlasReady || this.instanceCount === 0) {
			return;
		}

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(this.program);
		gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
		gl.uniform2f(this.uniforms.glyphSize, GLYPH_WIDTH * this.dpr, GLYPH_HEIGHT * this.dpr);
		gl.uniform2f(
			this.uniforms.atlasGrid,
			ATLAS_COLUMNS,
			Math.ceil(CHARACTERS.length / ATLAS_COLUMNS),
		);
		const text = toUnitRgb(this.theme.palette.text);
		gl.uniform4f(this.uniforms.color, text[0], text[1], text[2], 0.88);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.atlas);
		gl.uniform1i(this.uniforms.atlas, 0);
		gl.bindVertexArray(this.vao);
		gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.instanceCount);
		gl.bindVertexArray(null);
	}

	dispose(): void {
		this.disposed = true;
		this.abortController.abort();
		this.reducedMotionQuery.removeEventListener("change", this.onReducedMotionChange);
		this.theme.dispose();
		this.canvas.style.touchAction = this.previousTouchAction;
		this.gl.deleteTexture(this.atlas);
		this.gl.deleteBuffer(this.quadBuffer);
		this.gl.deleteBuffer(this.positionBuffer);
		this.gl.deleteBuffer(this.glyphBuffer);
		this.gl.deleteVertexArray(this.vao);
		this.gl.deleteProgram(this.program);
	}

	private configureGeometry(): void {
		const gl = this.gl;
		gl.bindVertexArray(this.vao);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(1, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphBuffer);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(2, 1);

		gl.bindVertexArray(null);
	}

	private configureEmptyAtlas(): void {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.atlas);
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			1,
			1,
			0,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255, 0]),
		);
		this.configureAtlasFiltering();
	}

	private async initializeAtlas(): Promise<void> {
		try {
			await document.fonts.load(`400 48px "Geist Mono"`);
			await document.fonts.ready;
		} catch (error) {
			console.warn(
				"Geist Mono did not load; using a monospace fallback for the bead curtain.",
				error,
			);
		}

		if (this.disposed) {
			return;
		}

		const rows = Math.ceil(CHARACTERS.length / ATLAS_COLUMNS);
		const atlasCanvas = document.createElement("canvas");
		atlasCanvas.width = ATLAS_COLUMNS * ATLAS_CELL_SIZE;
		atlasCanvas.height = rows * ATLAS_CELL_SIZE;
		const context = atlasCanvas.getContext("2d");

		if (!context) {
			console.error("Could not create the bead-curtain glyph atlas.");
			return;
		}

		context.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height);
		context.fillStyle = "#ffffff";
		context.font = `400 48px "Geist Mono", monospace`;
		context.textAlign = "center";
		context.textBaseline = "middle";

		for (let index = 0; index < CHARACTERS.length; index += 1) {
			const column = index % ATLAS_COLUMNS;
			const row = Math.floor(index / ATLAS_COLUMNS);
			context.fillText(
				CHARACTERS[index] ?? "?",
				column * ATLAS_CELL_SIZE + ATLAS_CELL_SIZE * 0.5,
				row * ATLAS_CELL_SIZE + ATLAS_CELL_SIZE * 0.5 + 1,
			);
		}

		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, this.atlas);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);
		gl.generateMipmap(gl.TEXTURE_2D);
		this.configureAtlasFiltering(true);
		this.atlasReady = true;
	}

	private configureAtlasFiltering(useMipmaps = false): void {
		const gl = this.gl;
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR,
		);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	private rebuildCurtain(width: number, height: number): void {
		const strandSpacing = STRAND_SPACING * this.dpr;
		const beadSpacing = BEAD_SPACING * this.dpr;
		this.strandCount = Math.max(1, Math.ceil(width / strandSpacing) + 1);
		this.beadsPerStrand = Math.max(2, Math.ceil(height / beadSpacing) + 1);
		this.instanceCount = this.strandCount * this.beadsPerStrand;

		this.positions = new Float32Array(this.instanceCount * 2);
		this.previousPositions = new Float32Array(this.instanceCount * 2);
		this.strandDirections = new Float32Array(this.strandCount);
		this.glyphIndices = new Float32Array(this.instanceCount);
		this.nextScrambleAt = new Float64Array(this.instanceCount);

		const startX = (width - (this.strandCount - 1) * strandSpacing) * 0.5;
		const now = performance.now();

		for (let strand = 0; strand < this.strandCount; strand += 1) {
			const x = startX + strand * strandSpacing;
			this.strandDirections[strand] = x <= width * 0.5 ? -1 : 1;

			for (let bead = 0; bead < this.beadsPerStrand; bead += 1) {
				const index = this.getIndex(strand, bead);
				const y = bead * beadSpacing;
				this.positions[index * 2] = x;
				this.positions[index * 2 + 1] = y;
				this.previousPositions[index * 2] = x;
				this.previousPositions[index * 2 + 1] = y;
				this.glyphIndices[index] = randomGlyphIndex();
				this.nextScrambleAt[index] = now + randomBetween(SCRAMBLE_MIN_DELAY, SCRAMBLE_MAX_DELAY);
			}
		}

		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.glyphIndices, gl.DYNAMIC_DRAW);
	}

	private simulate(
		deltaSeconds: number,
		colliderX: number,
		colliderY: number,
		pointerStepX: number,
		pointerStepY: number,
	): void {
		const radius = POINTER_RADIUS * this.dpr;
		const radiusSquared = radius * radius;
		let pointerVelocityX = pointerStepX / deltaSeconds;
		let pointerVelocityY = pointerStepY / deltaSeconds;
		const pointerSpeed = Math.hypot(pointerVelocityX, pointerVelocityY);
		const maxPointerSpeed = MAX_POINTER_SPEED * this.dpr;

		if (pointerSpeed > maxPointerSpeed) {
			const scale = maxPointerSpeed / pointerSpeed;
			pointerVelocityX *= scale;
			pointerVelocityY *= scale;
		}

		const gravityStep = GRAVITY * this.dpr;

		for (let strand = 0; strand < this.strandCount; strand += 1) {
			for (let bead = 1; bead < this.beadsPerStrand; bead += 1) {
				const index = this.getIndex(strand, bead);
				const offset = index * 2;
				const x = this.positions[offset] ?? 0;
				const y = this.positions[offset + 1] ?? 0;
				const velocityX = (x - (this.previousPositions[offset] ?? x)) * VERLET_DAMPING;
				const velocityY = (y - (this.previousPositions[offset + 1] ?? y)) * VERLET_DAMPING;
				let accelerationX = 0;
				let accelerationY = gravityStep;

				if (this.pointerActive) {
					let dx = x - colliderX;
					let dy = y - colliderY;
					let distanceSquared = dx * dx + dy * dy;

					if (distanceSquared < radiusSquared) {
						let distance = Math.sqrt(distanceSquared);

						if (distance < 0.001) {
							dx = this.strandDirections[strand] || -1;
							dy = 0;
							distance = 1;
							distanceSquared = 1;
						}

						const influence = 1 - Math.sqrt(distanceSquared) / radius;
						const smoothInfluence = influence * influence;
						const normalX = dx / distance;
						const normalY = dy / distance;
						accelerationX += normalX * POINTER_FORCE * this.dpr * smoothInfluence;
						accelerationY += normalY * POINTER_FORCE * this.dpr * smoothInfluence;
						accelerationX += pointerVelocityX * POINTER_DRAG * smoothInfluence;
						accelerationY += pointerVelocityY * POINTER_DRAG * smoothInfluence;

						if (Math.abs(normalX) > 0.05) {
							this.strandDirections[strand] = Math.sign(normalX);
						}
					}
				}

				this.previousPositions[offset] = x;
				this.previousPositions[offset + 1] = y;
				this.positions[offset] = x + velocityX + accelerationX * deltaSeconds * deltaSeconds;
				this.positions[offset + 1] = y + velocityY + accelerationY * deltaSeconds * deltaSeconds;
			}
		}

		const restLength = BEAD_SPACING * this.dpr;

		for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration += 1) {
			for (let strand = 0; strand < this.strandCount; strand += 1) {
				this.pinTop(strand);

				for (let bead = 0; bead < this.beadsPerStrand - 1; bead += 1) {
					this.constrainPair(strand, bead, restLength);
				}
			}
		}
	}

	private pinTop(strand: number): void {
		const index = this.getIndex(strand, 0) * 2;
		const spacing = STRAND_SPACING * this.dpr;
		const startX = (this.canvas.width - (this.strandCount - 1) * spacing) * 0.5;
		const x = startX + strand * spacing;
		this.positions[index] = x;
		this.positions[index + 1] = 0;
		this.previousPositions[index] = x;
		this.previousPositions[index + 1] = 0;
	}

	private constrainPair(strand: number, bead: number, restLength: number): void {
		const first = this.getIndex(strand, bead) * 2;
		const second = this.getIndex(strand, bead + 1) * 2;
		let dx = (this.positions[second] ?? 0) - (this.positions[first] ?? 0);
		let dy = (this.positions[second + 1] ?? 0) - (this.positions[first + 1] ?? 0);
		let distance = Math.hypot(dx, dy);

		if (distance < 0.0001) {
			dx = 0;
			dy = restLength;
			distance = restLength;
			this.positions[second + 1] = (this.positions[first + 1] ?? 0) + restLength;
		}

		const correction = (distance - restLength) / distance;

		if (bead === 0) {
			this.positions[second] = (this.positions[second] ?? 0) - dx * correction;
			this.positions[second + 1] = (this.positions[second + 1] ?? 0) - dy * correction;
			return;
		}

		const halfCorrection = correction * 0.5;
		this.positions[first] = (this.positions[first] ?? 0) + dx * halfCorrection;
		this.positions[first + 1] = (this.positions[first + 1] ?? 0) + dy * halfCorrection;
		this.positions[second] = (this.positions[second] ?? 0) - dx * halfCorrection;
		this.positions[second + 1] = (this.positions[second + 1] ?? 0) - dy * halfCorrection;
	}

	private uploadPositions(): void {
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.positions);
	}

	private updateScrambling(timestamp: number): void {
		let changed = 0;
		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphBuffer);

		for (
			let index = 0;
			index < this.instanceCount && changed < MAX_SCRAMBLES_PER_FRAME;
			index += 1
		) {
			if (timestamp < (this.nextScrambleAt[index] ?? Infinity)) {
				continue;
			}

			const previous = this.glyphIndices[index] ?? 0;
			let next = randomGlyphIndex();
			if (next === previous) next = (next + 1) % CHARACTERS.length;
			this.glyphIndices[index] = next;
			this.nextScrambleAt[index] =
				timestamp + randomBetween(SCRAMBLE_MIN_DELAY, SCRAMBLE_MAX_DELAY);
			gl.bufferSubData(
				gl.ARRAY_BUFFER,
				index * Float32Array.BYTES_PER_ELEMENT,
				this.glyphIndices.subarray(index, index + 1),
			);
			changed += 1;
		}
	}

	private bindEvents(): void {
		const { signal } = this.abortController;
		this.canvas.style.touchAction = this.reduceMotion ? this.previousTouchAction : "none";
		this.canvas.addEventListener("pointerenter", (event) => this.setPointer(event), { signal });
		this.canvas.addEventListener("pointermove", (event) => this.setPointer(event), { signal });
		this.canvas.addEventListener(
			"pointerdown",
			(event) => {
				this.setPointer(event);
				this.canvas.setPointerCapture(event.pointerId);
			},
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerleave",
			() => {
				this.pointerActive = false;
			},
			{ signal },
		);
		this.canvas.addEventListener("pointercancel", (event) => this.endPointer(event), { signal });
		this.canvas.addEventListener(
			"pointerup",
			(event) => {
				if (event.pointerType !== "mouse") this.pointerActive = false;
				this.releasePointer(event);
			},
			{ signal },
		);
		this.reducedMotionQuery.addEventListener("change", this.onReducedMotionChange);
	}

	private setPointer(event: PointerEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		const nextX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
		const nextY = (event.clientY - rect.top) * (this.canvas.height / rect.height);

		if (!this.pointerActive) {
			this.simulatedPointerX = nextX;
			this.simulatedPointerY = nextY;
		}

		this.pointerX = nextX;
		this.pointerY = nextY;
		this.pointerActive = !this.reduceMotion;
	}

	private endPointer(event: PointerEvent): void {
		this.pointerActive = false;
		this.releasePointer(event);
	}

	private releasePointer(event: PointerEvent): void {
		if (this.canvas.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}
	}

	private onReducedMotionChange = (event: MediaQueryListEvent): void => {
		this.reduceMotion = event.matches;
		this.pointerActive = false;
		this.canvas.style.touchAction = event.matches ? this.previousTouchAction : "none";
		this.accumulator = 0;
		this.rebuildCurtain(this.canvas.width, this.canvas.height);
	};

	private getIndex(strand: number, bead: number): number {
		return strand * this.beadsPerStrand + bead;
	}
}

function randomGlyphIndex(): number {
	return Math.floor(Math.random() * CHARACTERS.length);
}

function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min);
}
