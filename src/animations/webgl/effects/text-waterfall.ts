/* biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook. */

import type { CubicBezier, Point } from "../math/bezier";
import { textWaterfallFragmentShader, textWaterfallVertexShader } from "./text-waterfall-shaders";

const LAYER_COUNT = 30;
const TEXT = "THANK YOU";
const TEXT_SCALE = 5.4;
const LETTER_SPACING = 2;

type Glyph = {
	id: number;
	char: string;
	width: number;
	height: number;
	xoffset: number;
	yoffset: number;
	xadvance: number;
	x: number;
	y: number;
};

type FontData = {
	pages: string[];
	chars: Glyph[];
	common: {
		lineHeight: number;
		base: number;
		scaleW: number;
		scaleH: number;
	};
	distanceField: {
		distanceRange: number;
	};
	kernings?: Array<{ first: number; second: number; amount: number }>;
};

type TextGeometry = {
	positions: Float32Array;
	uvs: Float32Array;
	indices: Uint16Array;
	width: number;
	height: number;
};

export class TextWaterfallRenderer {
	private readonly gl: WebGL2RenderingContext;
	private readonly program: WebGLProgram;
	private readonly vao: WebGLVertexArrayObject;
	private atlas: WebGLTexture | null = null;
	private font: FontData | null = null;
	private indexCount = 0;
	private textSize: Point = { x: 1, y: 1 };
	private dpr = 1;
	private visible = true;
	private targetMouse: Point = { x: 0, y: 0 };
	private currentMouse: Point = { x: 0, y: 0 };
	private readonly abortController = new AbortController();

	constructor(private readonly canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: true,
			depth: false,
			stencil: false,
		});

		if (!gl) {
			throw new Error("WebGL2 is not supported in this browser.");
		}

		this.gl = gl;
		this.program = createProgram(gl, textWaterfallVertexShader, textWaterfallFragmentShader);
		this.vao = requireVao(gl);
		this.bindEvents();
		void this.loadAssets();
	}

	resize() {
		const { width, height } = this.canvas.getBoundingClientRect();
		const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
		const pixelWidth = Math.max(1, Math.floor(width * dpr));
		const pixelHeight = Math.max(1, Math.floor(height * dpr));

		if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
			this.canvas.width = pixelWidth;
			this.canvas.height = pixelHeight;
		}

		this.dpr = dpr;
		this.targetMouse = { x: pixelWidth * 0.5, y: pixelHeight * 0.5 };
		this.currentMouse = { ...this.targetMouse };
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	render() {
		if (!this.visible) {
			return;
		}

		this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.18;
		this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.18;

		const gl = this.gl;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);

		if (!this.atlas || this.indexCount === 0 || !this.font) {
			return;
		}

		const curve = this.getCurve();

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.useProgram(this.program);
		gl.uniform2f(
			getUniform(gl, this.program, "u_resolution"),
			this.canvas.width,
			this.canvas.height,
		);
		gl.uniform2f(getUniform(gl, this.program, "u_textSize"), this.textSize.x, this.textSize.y);
		gl.uniform2f(getUniform(gl, this.program, "u_p0"), curve.p0.x, curve.p0.y);
		gl.uniform2f(getUniform(gl, this.program, "u_p1"), curve.p1.x, curve.p1.y);
		gl.uniform2f(getUniform(gl, this.program, "u_p2"), curve.p2.x, curve.p2.y);
		gl.uniform2f(getUniform(gl, this.program, "u_p3"), curve.p3.x, curve.p3.y);
		gl.uniform1i(getUniform(gl, this.program, "u_layerCount"), LAYER_COUNT);
		gl.uniform1f(getUniform(gl, this.program, "u_pxRange"), this.font.distanceField.distanceRange);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.atlas);
		gl.uniform1i(getUniform(gl, this.program, "u_atlas"), 0);
		gl.bindVertexArray(this.vao);
		gl.drawElementsInstanced(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0, LAYER_COUNT);
		gl.bindVertexArray(null);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	dispose() {
		this.abortController.abort();
		if (this.atlas) {
			this.gl.deleteTexture(this.atlas);
		}
		this.gl.deleteProgram(this.program);
	}

	private bindEvents() {
		const { signal } = this.abortController;

		this.canvas.addEventListener("pointermove", (event) => this.setPointer(event, true), {
			signal,
		});
		this.canvas.addEventListener("pointerenter", (event) => this.setPointer(event, true), {
			signal,
		});
		this.canvas.addEventListener(
			"pointerleave",
			() => {
				this.targetMouse = { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 };
			},
			{ signal },
		);
	}

	private setPointer(event: PointerEvent, active: boolean) {
		const rect = this.canvas.getBoundingClientRect();
		if (!active) {
			return;
		}

		this.targetMouse = {
			x: (event.clientX - rect.left) * this.dpr,
			y: (event.clientY - rect.top) * this.dpr,
		};
	}

	private getCurve(): CubicBezier {
		const center = { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 };
		const target = this.currentMouse;
		const dx = target.x - center.x;
		const dy = target.y - center.y;
		const distance = Math.hypot(dx, dy);
		const bendStrength = Math.min(
			1,
			distance / (Math.min(this.canvas.width, this.canvas.height) * 0.34),
		);
		const bend = { x: -dy * 0.26 * bendStrength, y: dx * 0.18 * bendStrength };

		return {
			p0: center,
			p1: { x: center.x + dx * 0.33 + bend.x, y: center.y + dy * 0.33 + bend.y },
			p2: { x: center.x + dx * 0.66 - bend.x * 0.45, y: center.y + dy * 0.66 - bend.y * 0.45 },
			p3: target,
		};
	}

	private async loadAssets() {
		const response = await fetch("/assets/msdf/wave-text.json");
		const font = (await response.json()) as FontData;
		this.font = font;
		const geometry = buildTextGeometry({
			font,
			text: TEXT,
			scale: TEXT_SCALE * this.dpr,
			letterSpacing: LETTER_SPACING,
		});
		this.textSize = { x: geometry.width, y: geometry.height };
		this.uploadGeometry(geometry);
		this.atlas = await loadTexture(this.gl, `/assets/msdf/${font.pages[0]}`);
	}

	private uploadGeometry(geometry: TextGeometry) {
		const gl = this.gl;
		gl.bindVertexArray(this.vao);
		bindAttribute(gl, 0, geometry.positions, 2);
		bindAttribute(gl, 1, geometry.uvs, 2);
		const ibo = requireBuffer(gl);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
		gl.bindVertexArray(null);
		this.indexCount = geometry.indices.length;
	}
}

function buildTextGeometry({
	font,
	text,
	scale,
	letterSpacing,
}: {
	font: FontData;
	text: string;
	scale: number;
	letterSpacing: number;
}): TextGeometry {
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	const glyphs = new Map(font.chars.map((glyph) => [glyph.char, glyph]));
	const gridX = 12;
	const gridY = 6;
	const baseline = font.common.base;
	const spaceAdvance = font.common.lineHeight * 0.25;
	let penX = 0;
	let minX = 0;
	let minY = 0;
	let maxX = 0;
	let maxY = 0;

	for (const char of text) {
		if (char === " ") {
			penX += spaceAdvance + letterSpacing;
			continue;
		}

		const glyph = glyphs.get(char);

		if (!glyph) {
			continue;
		}

		const gx0 = penX + glyph.xoffset;
		const gy0 = glyph.yoffset - baseline;
		const gx1 = gx0 + glyph.width;
		const gy1 = gy0 + glyph.height;
		const u0 = glyph.x / font.common.scaleW;
		const v0 = glyph.y / font.common.scaleH;
		const u1 = (glyph.x + glyph.width) / font.common.scaleW;
		const v1 = (glyph.y + glyph.height) / font.common.scaleH;
		const baseIndex = positions.length / 2;

		minX = Math.min(minX, gx0 * scale);
		minY = Math.min(minY, gy0 * scale);
		maxX = Math.max(maxX, gx1 * scale);
		maxY = Math.max(maxY, gy1 * scale);

		for (let iy = 0; iy <= gridY; iy += 1) {
			const ty = iy / gridY;
			for (let ix = 0; ix <= gridX; ix += 1) {
				const tx = ix / gridX;
				positions.push((gx0 + (gx1 - gx0) * tx) * scale, (gy0 + (gy1 - gy0) * ty) * scale);
				uvs.push(u0 + (u1 - u0) * tx, v0 + (v1 - v0) * ty);
			}
		}

		const vertsPerRow = gridX + 1;
		for (let iy = 0; iy < gridY; iy += 1) {
			for (let ix = 0; ix < gridX; ix += 1) {
				const rowStart = baseIndex + iy * vertsPerRow;
				const tl = rowStart + ix;
				const tr = tl + 1;
				const bl = rowStart + vertsPerRow + ix;
				const br = bl + 1;
				indices.push(tl, bl, tr, tr, bl, br);
			}
		}

		penX += glyph.xadvance + letterSpacing;
	}

	for (let index = 0; index < positions.length; index += 2) {
		positions[index] = (positions[index] ?? 0) - minX;
		positions[index + 1] = (positions[index + 1] ?? 0) - minY;
	}

	return {
		positions: new Float32Array(positions),
		uvs: new Float32Array(uvs),
		indices: new Uint16Array(indices),
		width: maxX - minX,
		height: maxY - minY,
	};
}

function createProgram(
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = gl.createProgram();

	if (!program) {
		throw new Error("Could not create WebGL program.");
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(`Could not link WebGL program: ${gl.getProgramInfoLog(program)}`);
	}

	return program;
}

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
	const shader = gl.createShader(type);

	if (!shader) {
		throw new Error("Could not create WebGL shader.");
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(`Could not compile WebGL shader: ${gl.getShaderInfoLog(shader)}`);
	}

	return shader;
}

const uniformCache = new WeakMap<WebGLProgram, Map<string, WebGLUniformLocation>>();

function getUniform(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
): WebGLUniformLocation {
	let programCache = uniformCache.get(program);

	if (!programCache) {
		programCache = new Map();
		uniformCache.set(program, programCache);
	}

	const cached = programCache.get(name);

	if (cached) {
		return cached;
	}

	const uniform = gl.getUniformLocation(program, name);

	if (!uniform) {
		throw new Error(`Missing uniform ${name}.`);
	}

	programCache.set(name, uniform);

	return uniform;
}

function requireVao(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
	const vao = gl.createVertexArray();

	if (!vao) {
		throw new Error("Could not create WebGL VAO.");
	}

	return vao;
}

function requireBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
	const buffer = gl.createBuffer();

	if (!buffer) {
		throw new Error("Could not create WebGL buffer.");
	}

	return buffer;
}

function bindAttribute(
	gl: WebGL2RenderingContext,
	location: number,
	data: Float32Array,
	size: number,
): void {
	const buffer = requireBuffer(gl);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function loadTexture(gl: WebGL2RenderingContext, src: string): Promise<WebGLTexture> {
	return new Promise<WebGLTexture>((resolve, reject) => {
		const image = new Image();
		image.addEventListener("load", () => {
			const texture = gl.createTexture();

			if (!texture) {
				reject(new Error("Could not create WebGL texture."));
				return;
			}

			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			resolve(texture);
		});
		image.addEventListener("error", () => reject(new Error(`Could not load ${src}.`)));
		image.src = src;
	});
}
