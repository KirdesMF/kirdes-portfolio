/* biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook. */
import { AnimationTheme, toUnitRgb } from "../../theme";
import {
	createWebGLProgram,
	requireWebGLBuffer,
	requireWebGLTexture,
	requireWebGLUniform,
	requireWebGLVertexArray,
} from "../helpers";

import {
	charactersLinesOverlayFragmentShader,
	charactersLinesOverlayVertexShader,
	charactersLinesPointFragmentShader,
	charactersLinesPointVertexShader,
	charactersLinesRepelFragmentShader,
	charactersLinesRepelVertexShader,
} from "./characters-lines-repel-shaders";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&%?";
const ATLAS_COLUMNS = 8;
const ATLAS_CELL_SIZE = 64;
const STREAM_SPACING = 24;
const GLYPH_ROW_SPACING = 10;
const GLYPH_WIDTH = 11;
const GLYPH_HEIGHT = 13;
const DEFAULT_REPELLER_RADIUS = 150;
const REPELLER_SNAP_DISTANCE = 200;
const DEFAULT_DURATION = 1.5;
const DEFAULT_WAVE_STRENGTH = 1.4;
const DEFAULT_WAVE_LENGTH = 0.3;
const MAX_DPR = 2;
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

type PointUniforms = {
	resolution: WebGLUniformLocation;
	pointSize: WebGLUniformLocation;
	color: WebGLUniformLocation;
};

type OverlayUniforms = {
	resolution: WebGLUniformLocation;
	pointer: WebGLUniformLocation;
	pointerActive: WebGLUniformLocation;
	radius: WebGLUniformLocation;
	dpr: WebGLUniformLocation;
	moireSpacing: WebGLUniformLocation;
	moireOffset: WebGLUniformLocation;
	mode: WebGLUniformLocation;
	lineColor: WebGLUniformLocation;
	circleColor: WebGLUniformLocation;
};

export class CharactersLinesRepelRenderer {
	private readonly gl: WebGL2RenderingContext;
	private readonly program: WebGLProgram;
	private readonly overlayProgram: WebGLProgram;
	private readonly pointProgram: WebGLProgram;
	private readonly vao: WebGLVertexArrayObject;
	private readonly overlayVao: WebGLVertexArrayObject;
	private readonly pointVao: WebGLVertexArrayObject;
	private readonly quadBuffer: WebGLBuffer;
	private readonly pointBuffer: WebGLBuffer;
	private readonly homeBuffer: WebGLBuffer;
	private readonly displacementBuffer: WebGLBuffer;
	private readonly glyphBuffer: WebGLBuffer;
	private readonly atlas: WebGLTexture;
	private readonly uniforms: Uniforms;
	private readonly overlayUniforms: OverlayUniforms;
	private readonly pointUniforms: PointUniforms;
	private readonly settingsElement: HTMLDivElement;
	private readonly abortController = new AbortController();
	private readonly theme: AnimationTheme;
	private readonly reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
	private readonly previousTouchAction: string;

	private homes = new Float32Array();
	private displacements = new Float32Array();
	private controlDisplacements = new Float32Array();
	private snapStarts = new Float32Array();
	private snapElapsed = new Float32Array();
	private snapping = new Uint8Array();
	private controlDirections = new Float32Array();
	private pointPositions = new Float32Array();
	private glyphIndices = new Float32Array();
	private nextScrambleAt = new Float64Array();
	private instanceCount = 0;
	private streamCount = 0;
	private rowsPerStream = 0;
	private streamStartX = 0;
	private dpr = 1;
	private lastTimestamp = 0;
	private atlasReady = false;
	private disposed = false;
	private reduceMotion = false;
	private pointerActive = false;
	private pointerX = -10_000;
	private pointerY = -10_000;
	private repellerRadius = DEFAULT_REPELLER_RADIUS;
	private snapDistance = REPELLER_SNAP_DISTANCE;
	private showPoints = true;
	private yAxisLocked = true;
	private duration = DEFAULT_DURATION;
	private waveStrength = DEFAULT_WAVE_STRENGTH;
	private waveLength = DEFAULT_WAVE_LENGTH;

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
		this.program = createWebGLProgram(
			gl,
			charactersLinesRepelVertexShader,
			charactersLinesRepelFragmentShader,
		);
		this.overlayProgram = createWebGLProgram(
			gl,
			charactersLinesOverlayVertexShader,
			charactersLinesOverlayFragmentShader,
		);
		this.pointProgram = createWebGLProgram(
			gl,
			charactersLinesPointVertexShader,
			charactersLinesPointFragmentShader,
		);
		this.vao = requireWebGLVertexArray(gl);
		this.overlayVao = requireWebGLVertexArray(gl);
		this.pointVao = requireWebGLVertexArray(gl);
		this.quadBuffer = requireWebGLBuffer(gl);
		this.pointBuffer = requireWebGLBuffer(gl);
		this.homeBuffer = requireWebGLBuffer(gl);
		this.displacementBuffer = requireWebGLBuffer(gl);
		this.glyphBuffer = requireWebGLBuffer(gl);
		this.atlas = requireWebGLTexture(gl);
		this.uniforms = {
			resolution: requireWebGLUniform(gl, this.program, "u_resolution"),
			glyphSize: requireWebGLUniform(gl, this.program, "u_glyphSize"),
			atlasGrid: requireWebGLUniform(gl, this.program, "u_atlasGrid"),
			atlas: requireWebGLUniform(gl, this.program, "u_atlas"),
			color: requireWebGLUniform(gl, this.program, "u_color"),
		};
		this.overlayUniforms = {
			resolution: requireWebGLUniform(gl, this.overlayProgram, "u_resolution"),
			pointer: requireWebGLUniform(gl, this.overlayProgram, "u_pointer"),
			pointerActive: requireWebGLUniform(gl, this.overlayProgram, "u_pointerActive"),
			radius: requireWebGLUniform(gl, this.overlayProgram, "u_radius"),
			dpr: requireWebGLUniform(gl, this.overlayProgram, "u_dpr"),
			moireSpacing: requireWebGLUniform(gl, this.overlayProgram, "u_moireSpacing"),
			moireOffset: requireWebGLUniform(gl, this.overlayProgram, "u_moireOffset"),
			mode: requireWebGLUniform(gl, this.overlayProgram, "u_mode"),
			lineColor: requireWebGLUniform(gl, this.overlayProgram, "u_lineColor"),
			circleColor: requireWebGLUniform(gl, this.overlayProgram, "u_circleColor"),
		};
		this.pointUniforms = {
			resolution: requireWebGLUniform(gl, this.pointProgram, "u_resolution"),
			pointSize: requireWebGLUniform(gl, this.pointProgram, "u_pointSize"),
			color: requireWebGLUniform(gl, this.pointProgram, "u_color"),
		};
		this.previousTouchAction = canvas.style.touchAction;
		this.reduceMotion = this.reducedMotionQuery.matches;
		this.theme = new AnimationTheme(canvas);

		this.configureGeometry();
		this.configurePointGeometry();
		this.configureEmptyAtlas();
		this.settingsElement = this.createSettings();
		this.bindEvents();
		void this.initializeAtlas();
	}

	resize(): void {
		const rect = this.canvas.getBoundingClientRect();
		const nextDpr = Math.max(1, Math.min(window.devicePixelRatio || 1, MAX_DPR));
		const width = Math.max(1, Math.round(rect.width * nextDpr));
		const height = Math.max(1, Math.round(rect.height * nextDpr));
		const changed =
			this.canvas.width !== width || this.canvas.height !== height || this.dpr !== nextDpr;

		if (!changed) {
			return;
		}

		this.dpr = nextDpr;
		this.canvas.width = width;
		this.canvas.height = height;
		this.gl.viewport(0, 0, width, height);
		this.rebuildField(width, height);
		this.pointerActive = false;
		this.lastTimestamp = 0;
	}

	render(timestamp: number): void {
		const deltaSeconds =
			this.lastTimestamp === 0
				? 1 / 60
				: Math.min(0.05, Math.max(0, (timestamp - this.lastTimestamp) / 1000));
		this.lastTimestamp = timestamp;

		if (!this.reduceMotion) {
			this.updateScrambling(timestamp);
			this.updateSprings(deltaSeconds);
		} else {
			this.resetMotion();
		}

		const gl = this.gl;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		const background = toUnitRgb(this.theme.palette.background);
		gl.clearColor(background[0], background[1], background[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.drawOverlay(0);

		if (this.atlasReady && this.instanceCount > 0) {
			gl.useProgram(this.program);
			gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
			gl.uniform2f(this.uniforms.glyphSize, GLYPH_WIDTH * this.dpr, GLYPH_HEIGHT * this.dpr);
			gl.uniform2f(
				this.uniforms.atlasGrid,
				ATLAS_COLUMNS,
				Math.ceil(CHARACTERS.length / ATLAS_COLUMNS),
			);
			const text = toUnitRgb(this.theme.palette.text);
			gl.uniform4f(this.uniforms.color, text[0], text[1], text[2], 0.82);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.atlas);
			gl.uniform1i(this.uniforms.atlas, 0);
			gl.bindVertexArray(this.vao);
			gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.instanceCount);
			gl.bindVertexArray(null);
		}

		if (this.showPoints) {
			this.drawControlPoints();
		}
		this.drawOverlay(1);
	}

	private drawControlPoints(): void {
		const gl = this.gl;
		gl.useProgram(this.pointProgram);
		gl.uniform2f(this.pointUniforms.resolution, this.canvas.width, this.canvas.height);
		gl.uniform1f(this.pointUniforms.pointSize, 6 * this.dpr);
		const pointColor = toUnitRgb(this.theme.palette.text);
		gl.uniform4f(this.pointUniforms.color, pointColor[0], pointColor[1], pointColor[2], 0.95);
		gl.bindVertexArray(this.pointVao);
		gl.drawArrays(gl.POINTS, 0, this.streamCount);
		gl.bindVertexArray(null);
	}

	private drawOverlay(mode: 0 | 1): void {
		const gl = this.gl;
		gl.useProgram(this.overlayProgram);
		gl.uniform2f(this.overlayUniforms.resolution, this.canvas.width, this.canvas.height);
		gl.uniform2f(this.overlayUniforms.pointer, this.pointerX, this.pointerY);
		gl.uniform1f(this.overlayUniforms.pointerActive, this.pointerActive ? 1 : 0);
		gl.uniform1f(this.overlayUniforms.radius, this.repellerRadius * this.dpr);
		gl.uniform1f(this.overlayUniforms.dpr, this.dpr);
		gl.uniform1f(this.overlayUniforms.moireSpacing, STREAM_SPACING * this.dpr);
		gl.uniform1f(this.overlayUniforms.moireOffset, this.streamStartX);
		gl.uniform1i(this.overlayUniforms.mode, mode);
		const text = toUnitRgb(this.theme.palette.text);
		gl.uniform3f(this.overlayUniforms.lineColor, text[0], text[1], text[2]);
		gl.uniform3f(this.overlayUniforms.circleColor, text[0], text[1], text[2]);
		gl.bindVertexArray(this.overlayVao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
	}

	dispose(): void {
		this.disposed = true;
		this.abortController.abort();
		this.reducedMotionQuery.removeEventListener("change", this.onReducedMotionChange);
		this.theme.dispose();
		this.canvas.style.touchAction = this.previousTouchAction;
		this.settingsElement.remove();
		this.gl.deleteTexture(this.atlas);
		this.gl.deleteBuffer(this.quadBuffer);
		this.gl.deleteBuffer(this.pointBuffer);
		this.gl.deleteBuffer(this.homeBuffer);
		this.gl.deleteBuffer(this.displacementBuffer);
		this.gl.deleteBuffer(this.glyphBuffer);
		this.gl.deleteVertexArray(this.vao);
		this.gl.deleteVertexArray(this.overlayVao);
		this.gl.deleteVertexArray(this.pointVao);
		this.gl.deleteProgram(this.program);
		this.gl.deleteProgram(this.overlayProgram);
		this.gl.deleteProgram(this.pointProgram);
	}

	private configureGeometry(): void {
		const gl = this.gl;
		gl.bindVertexArray(this.vao);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.homeBuffer);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(1, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.displacementBuffer);
		gl.enableVertexAttribArray(2);
		gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(2, 1);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphBuffer);
		gl.enableVertexAttribArray(3);
		gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 0, 0);
		gl.vertexAttribDivisor(3, 1);

		gl.bindVertexArray(null);
	}

	private configurePointGeometry(): void {
		const gl = this.gl;
		gl.bindVertexArray(this.pointVao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
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
				"Geist Mono did not load; using the monospace fallback for the glyph atlas.",
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
			console.error("Could not create the character atlas canvas.");
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
			const x = column * ATLAS_CELL_SIZE + ATLAS_CELL_SIZE * 0.5;
			const y = row * ATLAS_CELL_SIZE + ATLAS_CELL_SIZE * 0.5;
			context.fillText(CHARACTERS[index] ?? "?", x, y + 1);
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

	private rebuildField(width: number, height: number): void {
		const streamSpacing = STREAM_SPACING * this.dpr;
		const rowSpacing = GLYPH_ROW_SPACING * this.dpr;
		const streamCount = Math.max(1, Math.ceil(width / streamSpacing) + 1);
		const rowCount = Math.max(1, Math.ceil(height / rowSpacing) + 2);
		const streamStartX = (width - (streamCount - 1) * streamSpacing) * 0.5;
		this.streamStartX = streamStartX;
		const rowStartY = (height - (rowCount - 1) * rowSpacing) * 0.5;
		const count = streamCount * rowCount;

		this.homes = new Float32Array(count * 2);
		this.displacements = new Float32Array(count * 2);
		this.controlDisplacements = new Float32Array(streamCount * 2);
		this.snapStarts = new Float32Array(streamCount * 2);
		this.snapElapsed = new Float32Array(streamCount * 2);
		this.snapping = new Uint8Array(streamCount * 2);
		this.controlDirections = new Float32Array(streamCount);
		this.pointPositions = new Float32Array(streamCount * 2);
		this.glyphIndices = new Float32Array(count);
		this.nextScrambleAt = new Float64Array(count);
		this.instanceCount = count;
		this.streamCount = streamCount;
		this.rowsPerStream = rowCount;

		const now = performance.now();
		let instance = 0;

		for (let stream = 0; stream < streamCount; stream += 1) {
			const x = streamStartX + stream * streamSpacing;
			this.controlDirections[stream] = x <= width * 0.5 ? -1 : 1;
			this.pointPositions[stream * 2] = x;
			this.pointPositions[stream * 2 + 1] = height * 0.5;

			for (let row = 0; row < rowCount; row += 1) {
				this.homes[instance * 2] = x;
				this.homes[instance * 2 + 1] = rowStartY + row * rowSpacing;
				this.glyphIndices[instance] = randomGlyphIndex();
				this.nextScrambleAt[instance] = now + randomBetween(SCRAMBLE_MIN_DELAY, SCRAMBLE_MAX_DELAY);
				instance += 1;
			}
		}

		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.homeBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.homes, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.displacementBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.displacements, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glyphBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.glyphIndices, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.pointPositions, gl.DYNAMIC_DRAW);
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

			if (next === previous) {
				next = (next + 1 + Math.floor(Math.random() * (CHARACTERS.length - 1))) % CHARACTERS.length;
			}

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

	private updateSprings(deltaSeconds: number): void {
		const radius = this.repellerRadius * this.dpr;
		const snapDistance = this.snapDistance * this.dpr;
		const middleY = this.canvas.height * 0.5;
		let changed = false;

		for (let stream = 0; stream < this.streamCount; stream += 1) {
			const firstInstance = stream * this.rowsPerStream;
			const homeX = this.homes[firstInstance * 2] ?? 0;
			const controlOffset = stream * 2;
			const displacementX = this.controlDisplacements[controlOffset] ?? 0;
			const displacementY = this.yAxisLocked
				? 0
				: (this.controlDisplacements[controlOffset + 1] ?? 0);
			const currentX = homeX + displacementX;
			const currentY = middleY + displacementY;
			const currentDx = currentX - this.pointerX;
			const currentDy = currentY - this.pointerY;
			const homeDx = homeX - this.pointerX;
			const homeDy = middleY - this.pointerY;
			const insideRepeller =
				this.pointerActive && currentDx * currentDx + currentDy * currentDy < radius * radius;
			const canRepel = homeDx * homeDx + homeDy * homeDy <= snapDistance * snapDistance;

			if (insideRepeller && canRepel) {
				const distance = Math.hypot(currentDx, currentDy);
				let directionX: number;
				let directionY: number;

				if (distance > 0.5 * this.dpr) {
					directionX = currentDx / distance;
					directionY = currentDy / distance;
					if (Math.abs(directionX) > 0.01) this.controlDirections[stream] = Math.sign(directionX);
				} else {
					directionX = this.controlDirections[stream] || -1;
					directionY = 0;
				}

				const edgeRadius = Math.max(0, radius - this.dpr);
				const nextX = this.pointerX + directionX * edgeRadius - homeX;
				const nextY = this.yAxisLocked ? 0 : this.pointerY + directionY * edgeRadius - middleY;
				changed ||=
					Math.abs(displacementX - nextX) > 0.001 || Math.abs(displacementY - nextY) > 0.001;
				this.controlDisplacements[controlOffset] = nextX;
				this.controlDisplacements[controlOffset + 1] = nextY;
				this.snapping[controlOffset] = 0;
				this.snapping[controlOffset + 1] = 0;
				continue;
			}

			for (let axis = 0; axis < 2; axis += 1) {
				const index = controlOffset + axis;

				if (axis === 1 && this.yAxisLocked) {
					if ((this.controlDisplacements[index] ?? 0) !== 0) changed = true;
					this.controlDisplacements[index] = 0;
					this.snapping[index] = 0;
					continue;
				}

				const displacement = this.controlDisplacements[index] ?? 0;

				if (this.snapping[index] === 0 && Math.abs(displacement) < 0.01) {
					if (displacement !== 0) changed = true;
					this.controlDisplacements[index] = 0;
					continue;
				}

				if (this.snapping[index] === 0) {
					this.snapStarts[index] = displacement;
					this.snapElapsed[index] = 0;
					this.snapping[index] = 1;
				}

				const elapsed = (this.snapElapsed[index] ?? 0) + deltaSeconds;
				const progress = Math.min(1, elapsed / this.duration);
				this.snapElapsed[index] = elapsed;
				this.controlDisplacements[index] =
					(this.snapStarts[index] ?? 0) *
					elasticRemaining(progress, this.waveStrength, this.waveLength);
				changed = true;

				if (progress >= 1) {
					this.controlDisplacements[index] = 0;
					this.snapping[index] = 0;
				}
			}
		}

		if (changed) {
			this.uploadCurveDisplacements();
		}
	}

	private resetMotion(): void {
		let changed = false;

		for (let index = 0; index < this.controlDisplacements.length; index += 1) {
			if ((this.controlDisplacements[index] ?? 0) !== 0) {
				this.controlDisplacements[index] = 0;
				changed = true;
			}
			this.snapping[index] = 0;
		}

		if (changed) {
			this.uploadCurveDisplacements();
		}
	}

	private uploadCurveDisplacements(): void {
		const middleY = this.canvas.height * 0.5;

		for (let stream = 0; stream < this.streamCount; stream += 1) {
			const controlOffset = stream * 2;
			const displacementX = this.controlDisplacements[controlOffset] ?? 0;
			const displacementY = this.controlDisplacements[controlOffset + 1] ?? 0;
			const start = stream * this.rowsPerStream;

			for (let row = 0; row < this.rowsPerStream; row += 1) {
				const instanceOffset = (start + row) * 2;
				this.displacements[instanceOffset] = displacementX;
				this.displacements[instanceOffset + 1] = displacementY;
			}

			const homeX = this.homes[start * 2] ?? 0;
			this.pointPositions[controlOffset] = homeX + displacementX;
			this.pointPositions[controlOffset + 1] = middleY + displacementY;
		}

		const gl = this.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.displacementBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.displacements);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.pointBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.pointPositions);
	}

	private createSettings(): HTMLDivElement {
		const panel = document.createElement("div");
		panel.className = "effect-settings";
		panel.innerHTML = `
      <div class="effect-settings__title">Line repel settings</div>
      <label class="effect-settings__range">
        <span>Repel size <output data-output-repel>${this.repellerRadius}</output></span>
        <input data-repel type="range" min="40" max="300" step="1" value="${this.repellerRadius}" />
      </label>
      <label class="effect-settings__range">
        <span>Snap distance <output data-output-snap>${this.snapDistance}</output></span>
        <input data-snap type="range" min="41" max="400" step="1" value="${this.snapDistance}" />
      </label>
      <label class="effect-settings__range">
        <span>Duration <output data-output-duration>${this.duration.toFixed(1)}</output></span>
        <input data-duration type="range" min="0.1" max="6" step="0.1" value="${this.duration}" />
      </label>
      <label class="effect-settings__range">
        <span>Wave strength <output data-output-strength>${this.waveStrength.toFixed(1)}</output></span>
        <input data-strength type="range" min="1" max="2.5" step="0.1" value="${this.waveStrength}" />
      </label>
      <label class="effect-settings__range">
        <span>Wave length <output data-output-length>${this.waveLength.toFixed(1)}</output></span>
        <input data-length type="range" min="0.1" max="1" step="0.1" value="${this.waveLength}" />
      </label>
      <label><input type="checkbox" data-show-points checked /> Show middle points</label>
      <label><input type="checkbox" data-lock-y checked /> Lock Y axis</label>
    `;

		const { signal } = this.abortController;
		const bindRange = (
			inputSelector: string,
			outputSelector: string,
			update: (value: number) => void,
		): HTMLInputElement | null => {
			const input = panel.querySelector<HTMLInputElement>(inputSelector);
			const output = panel.querySelector<HTMLOutputElement>(outputSelector);
			input?.addEventListener(
				"input",
				() => {
					const value = Number(input.value);
					update(value);
					if (output) output.value = input.value;
				},
				{ signal },
			);
			return input;
		};

		bindRange("[data-snap]", "[data-output-snap]", (value) => {
			this.snapDistance = value;
		});
		bindRange("[data-repel]", "[data-output-repel]", (value) => {
			this.repellerRadius = value;
		});
		bindRange("[data-duration]", "[data-output-duration]", (value) => {
			this.duration = value;
			this.restartActiveSnaps();
		});
		bindRange("[data-strength]", "[data-output-strength]", (value) => {
			this.waveStrength = value;
			this.restartActiveSnaps();
		});
		bindRange("[data-length]", "[data-output-length]", (value) => {
			this.waveLength = value;
			this.restartActiveSnaps();
		});

		const showPoints = panel.querySelector<HTMLInputElement>("[data-show-points]");
		const lockY = panel.querySelector<HTMLInputElement>("[data-lock-y]");
		showPoints?.addEventListener(
			"change",
			() => {
				this.showPoints = showPoints.checked;
			},
			{ signal },
		);
		lockY?.addEventListener(
			"change",
			() => {
				this.yAxisLocked = lockY.checked;
				if (this.yAxisLocked) {
					for (let stream = 0; stream < this.streamCount; stream += 1) {
						this.controlDisplacements[stream * 2 + 1] = 0;
						this.snapping[stream * 2 + 1] = 0;
					}
					this.uploadCurveDisplacements();
				}
			},
			{ signal },
		);

		(this.canvas.parentElement ?? document.body).append(panel);
		return panel;
	}

	private restartActiveSnaps(): void {
		for (let index = 0; index < this.snapping.length; index += 1) {
			if (this.snapping[index] === 0) continue;
			this.snapStarts[index] = this.controlDisplacements[index] ?? 0;
			this.snapElapsed[index] = 0;
		}
	}

	private bindEvents(): void {
		const { signal } = this.abortController;
		this.canvas.style.touchAction = "none";

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
		this.canvas.addEventListener(
			"pointercancel",
			(event) => {
				this.pointerActive = false;
				if (this.canvas.hasPointerCapture(event.pointerId)) {
					this.canvas.releasePointerCapture(event.pointerId);
				}
			},
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerup",
			(event) => {
				if (event.pointerType !== "mouse") {
					this.pointerActive = false;
				}
				if (this.canvas.hasPointerCapture(event.pointerId)) {
					this.canvas.releasePointerCapture(event.pointerId);
				}
			},
			{ signal },
		);
		this.reducedMotionQuery.addEventListener("change", this.onReducedMotionChange);
	}

	private setPointer(event: PointerEvent): void {
		const rect = this.canvas.getBoundingClientRect();

		if (rect.width <= 0 || rect.height <= 0) {
			return;
		}

		this.pointerX = (event.clientX - rect.left) * (this.canvas.width / rect.width);
		this.pointerY = (event.clientY - rect.top) * (this.canvas.height / rect.height);
		this.pointerActive = !this.reduceMotion;
	}

	private onReducedMotionChange = (event: MediaQueryListEvent): void => {
		this.reduceMotion = event.matches;
		this.pointerActive = false;

		if (!event.matches) {
			const now = performance.now();
			for (let index = 0; index < this.instanceCount; index += 1) {
				this.nextScrambleAt[index] = now + randomBetween(SCRAMBLE_MIN_DELAY, SCRAMBLE_MAX_DELAY);
			}
		}
	};
}

function elasticRemaining(progress: number, strength: number, waveLength: number): number {
	if (progress <= 0) return 1;
	if (progress >= 1) return 0;

	const amplitude = Math.max(1, strength);
	const period = Math.max(0.01, waveLength);
	const phase = (period / (Math.PI * 2)) * Math.asin(1 / amplitude);
	const ease =
		amplitude * 2 ** (-10 * progress) * Math.sin(((progress - phase) * Math.PI * 2) / period) + 1;
	return 1 - ease;
}

function randomGlyphIndex(): number {
	return Math.floor(Math.random() * CHARACTERS.length);
}

function randomBetween(min: number, max: number): number {
	return min + Math.random() * (max - min);
}
