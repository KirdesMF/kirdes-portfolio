/* biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook. */
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

const lineVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in float a_x;
layout(location = 1) in float a_side;

uniform vec2 u_resolution;
uniform float u_phase;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_lineWidthPx;

void main() {
  float width = u_resolution.x;
  float height = u_resolution.y;
  float xWorld = clamp(a_x, 0.0, 1.0) * width;
  float arg = xWorld * u_frequency + u_phase;
  float wave = sin(arg) * u_amplitude;
  float baseline = height * 0.5 + wave;
  float slope = cos(arg) * u_amplitude * u_frequency;
  vec2 tangent = normalize(vec2(1.0, slope));
  vec2 normal = vec2(-tangent.y, tangent.x);
  vec2 worldPos = vec2(xWorld, baseline) + normal * a_side * u_lineWidthPx * 0.5;

  gl_Position = vec4((worldPos.x / width) * 2.0 - 1.0, ((worldPos.y / height) * 2.0 - 1.0) * -1.0, 0.0, 1.0);
}
`;

const lineFragmentShader = `#version 300 es
precision highp float;

out vec4 outColor;
uniform vec4 u_color;

void main() {
  outColor = u_color;
}
`;

const backgroundVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

out vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const backgroundFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_texture;
uniform vec4 u_color;

in vec2 v_uv;
out vec4 outColor;

void main() {
  float mask = texture(u_texture, v_uv).r;

  if (mask <= 0.01) {
    discard;
  }

  outColor = vec4(u_color.rgb, u_color.a * mask);
}
`;

const textVertexShader = `#version 300 es
precision highp float;

layout(location = 0) in vec2 a_position;
layout(location = 1) in vec2 a_uv;

uniform vec2 u_resolution;
uniform float u_phase;
uniform float u_amplitude;
uniform float u_frequency;
uniform vec2 u_offset;

out vec2 v_uv;

void main() {
  v_uv = a_uv;
  float xWorld = a_position.x + u_offset.x;
  float arg = xWorld * u_frequency + u_phase;
  float wave = sin(arg) * u_amplitude;
  float baselineY = u_resolution.y * 0.5 + wave;
  float slope = cos(arg) * u_amplitude * u_frequency;
  vec2 tangent = normalize(vec2(1.0, slope));
  vec2 normal = vec2(-tangent.y, tangent.x);
  vec2 curvePos = vec2(xWorld, baselineY);
  vec2 basePos = curvePos - normal * u_offset.y;
  vec2 worldPos = basePos + normal * a_position.y;

  gl_Position = vec4((worldPos.x / u_resolution.x) * 2.0 - 1.0, ((worldPos.y / u_resolution.y) * 2.0 - 1.0) * -1.0, 0.0, 1.0);
}
`;

const textFragmentShader = `#version 300 es
precision highp float;

uniform sampler2D u_atlas;
uniform sampler2D u_charTexture;
uniform vec4 u_color;
uniform float u_pxRange;
uniform vec2 u_resolution;

in vec2 v_uv;
out vec4 outColor;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 msd = texture(u_atlas, v_uv).rgb;
  float sd = median(msd.r, msd.g, msd.b) - 0.5;
  float textMask = clamp(sd * u_pxRange + 0.5, 0.0, 1.0);
  float strokeMask = (1.0 - smoothstep(0.13, 0.2, abs(sd))) * (1.0 - textMask * 0.65);
  vec2 charUv = vec2(gl_FragCoord.x / u_resolution.x, 1.0 - gl_FragCoord.y / u_resolution.y);
  float charMask = texture(u_charTexture, charUv).r;
  float fillAlpha = textMask * charMask;
  float alpha = max(fillAlpha, strokeMask * 0.72);

  if (alpha <= 0.01) {
    discard;
  }

  vec3 strokeColor = vec3(0.78, 0.84, 0.92);
  vec3 color = mix(strokeColor, u_color.rgb, fillAlpha);
  outColor = vec4(color, u_color.a * alpha);
}
`;

export class WaveTextRenderer {
	private readonly gl: WebGL2RenderingContext;
	private font: FontData | null = null;
	private atlas: WebGLTexture | null = null;
	private readonly charCanvas = document.createElement("canvas");
	private readonly charContext: CanvasRenderingContext2D;
	private readonly charTexture: WebGLTexture;
	private readonly backgroundCharCanvas = document.createElement("canvas");
	private readonly backgroundCharContext: CanvasRenderingContext2D;
	private readonly backgroundCharTexture: WebGLTexture;
	private dpr = 1;
	private phase = 0;
	private amplitude = 190;
	private frequency = 0.006;
	private speed = 4;
	private activePointerId: number | null = null;
	private lastX = 0;
	private lastY = 0;
	private textWidth = 0;
	private lastCharFrame = -1;
	private readonly abortController = new AbortController();
	private readonly backgroundProgram: WebGLProgram;
	private readonly lineProgram: WebGLProgram;
	private readonly textProgram: WebGLProgram;
	private readonly backgroundVao: WebGLVertexArrayObject;
	private readonly lineVao: WebGLVertexArrayObject;
	private readonly textVao: WebGLVertexArrayObject;
	private readonly lineIndexCount: number;
	private textIndexCount = 0;

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

		const charTexture = gl.createTexture();
		const backgroundCharTexture = gl.createTexture();
		const charContext = this.charCanvas.getContext("2d", { alpha: false });
		const backgroundCharContext = this.backgroundCharCanvas.getContext("2d", { alpha: false });

		if (!charTexture || !backgroundCharTexture || !charContext || !backgroundCharContext) {
			throw new Error("Could not create wave text char texture.");
		}

		this.gl = gl;
		this.charTexture = charTexture;
		this.backgroundCharTexture = backgroundCharTexture;
		this.charContext = charContext;
		this.backgroundCharContext = backgroundCharContext;
		this.backgroundProgram = createProgram(gl, backgroundVertexShader, backgroundFragmentShader);
		this.lineProgram = createProgram(gl, lineVertexShader, lineFragmentShader);
		this.textProgram = createProgram(gl, textVertexShader, textFragmentShader);
		this.backgroundVao = this.createBackgroundGeometry();
		const line = this.createLineGeometry();
		this.lineVao = line.vao;
		this.lineIndexCount = line.indexCount;
		this.textVao = requireVao(gl);
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
		this.charCanvas.width = this.canvas.width;
		this.charCanvas.height = this.canvas.height;
		this.backgroundCharCanvas.width = this.canvas.width;
		this.backgroundCharCanvas.height = this.canvas.height;
		this.lastCharFrame = -1;
		this.updateBackgroundCharTexture();
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	render(timestamp: number) {
		const gl = this.gl;
		this.phase += 0.016 * this.speed;

		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0.035, 0.035, 0.043, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const amplitude = this.amplitude * this.dpr;
		const frequency = this.frequency / this.dpr;
		this.updateCharTexture(timestamp);
		this.drawMutedCharBackground();
		this.drawLine(amplitude, frequency);
		this.drawText(amplitude, frequency);
	}

	setVisible(_visible: boolean) {}

	dispose() {
		this.abortController.abort();
		this.gl.deleteProgram(this.backgroundProgram);
		this.gl.deleteProgram(this.lineProgram);
		this.gl.deleteProgram(this.textProgram);
		if (this.atlas) {
			this.gl.deleteTexture(this.atlas);
		}
		this.gl.deleteTexture(this.charTexture);
		this.gl.deleteTexture(this.backgroundCharTexture);
	}

	private bindEvents() {
		const { signal } = this.abortController;

		this.canvas.addEventListener(
			"pointerdown",
			(event) => {
				if (this.activePointerId !== null) {
					return;
				}

				this.activePointerId = event.pointerId;
				this.lastX = event.clientX;
				this.lastY = event.clientY;
				this.canvas.setPointerCapture(event.pointerId);
			},
			{ signal },
		);
		this.canvas.addEventListener(
			"pointermove",
			(event) => {
				if (this.activePointerId !== event.pointerId) {
					return;
				}

				const dx = event.clientX - this.lastX;
				const dy = event.clientY - this.lastY;
				this.lastX = event.clientX;
				this.lastY = event.clientY;

				if (event.shiftKey) {
					this.speed = clamp(this.speed - dy * 0.02, 0, 20);
					return;
				}

				this.amplitude = clamp(this.amplitude - dy * 0.9, 0, 500);
				this.frequency = clamp(this.frequency + dx * 0.00001, 0.0005, 0.02);
			},
			{ signal },
		);
		const endPointer = (event: PointerEvent) => {
			if (this.activePointerId !== event.pointerId) {
				return;
			}

			this.activePointerId = null;
			this.canvas.releasePointerCapture(event.pointerId);
		};
		this.canvas.addEventListener("pointerup", endPointer, { signal });
		this.canvas.addEventListener("pointercancel", endPointer, { signal });
	}

	private async loadAssets() {
		const response = await fetch("/assets/msdf/wave-text.json");
		this.font = (await response.json()) as FontData;
		this.createTextGeometry("THANK YOU", 4, 2);
		this.atlas = await loadTexture(this.gl, `/assets/msdf/${this.font.pages[0]}`);
	}

	private drawMutedCharBackground() {
		const gl = this.gl;

		gl.useProgram(this.backgroundProgram);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.backgroundCharTexture);
		gl.uniform1i(getUniform(gl, this.backgroundProgram, "u_texture"), 0);
		gl.uniform4f(getUniform(gl, this.backgroundProgram, "u_color"), 0.24, 0.27, 0.33, 0.38);
		gl.bindVertexArray(this.backgroundVao);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		gl.bindVertexArray(null);
	}

	private drawLine(amplitude: number, frequency: number) {
		const gl = this.gl;
		gl.useProgram(this.lineProgram);
		gl.uniform2f(
			getUniform(gl, this.lineProgram, "u_resolution"),
			this.canvas.width,
			this.canvas.height,
		);
		gl.uniform1f(getUniform(gl, this.lineProgram, "u_phase"), this.phase);
		gl.uniform1f(getUniform(gl, this.lineProgram, "u_amplitude"), amplitude);
		gl.uniform1f(getUniform(gl, this.lineProgram, "u_frequency"), frequency);
		gl.uniform1f(getUniform(gl, this.lineProgram, "u_lineWidthPx"), 1.5 * this.dpr);
		gl.uniform4f(getUniform(gl, this.lineProgram, "u_color"), 0.97, 0.98, 1, 1);
		gl.bindVertexArray(this.lineVao);
		gl.drawElements(gl.TRIANGLES, this.lineIndexCount, gl.UNSIGNED_SHORT, 0);
		gl.bindVertexArray(null);
	}

	private updateBackgroundCharTexture() {
		this.drawCharField(this.backgroundCharContext, this.backgroundCharCanvas, 0, false);
		this.uploadCharTexture(this.backgroundCharCanvas, this.backgroundCharTexture);
	}

	private updateCharTexture(timestamp: number) {
		const frame = Math.floor(timestamp / 90);

		if (frame === this.lastCharFrame) {
			return;
		}

		this.lastCharFrame = frame;
		this.drawCharField(this.charContext, this.charCanvas, frame, true);
		this.uploadCharTexture(this.charCanvas, this.charTexture);
	}

	private drawCharField(
		context: CanvasRenderingContext2D,
		canvas: HTMLCanvasElement,
		frame: number,
		animated: boolean,
	) {
		const chars = "THANKYOUCEDRICGOURVILLE2026";
		const cell = 11 * this.dpr;

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.fillStyle = "#000000";
		context.fillRect(0, 0, canvas.width, canvas.height);
		context.font = `${10 * this.dpr}px Geist Mono, monospace`;
		context.textBaseline = "top";
		context.fillStyle = "#ffffff";

		for (let y = -cell; y < canvas.height + cell; y += cell) {
			for (let x = -cell; x < canvas.width + cell; x += cell) {
				const cellX = Math.floor(x / cell);
				const cellY = Math.floor(y / cell);
				const seed = cellX * 17.13 + cellY * 41.71;
				const animatedSeed = animated ? seed + frame * 3.31 : seed;
				const char = chars[Math.floor(hash1D(animatedSeed) * chars.length) % chars.length];
				const jitter = (hash1D(seed + 9.7) - 0.5) * this.dpr;
				context.fillText(char ?? " ", x + jitter, y);
			}
		}
	}

	private uploadCharTexture(canvas: HTMLCanvasElement, texture: WebGLTexture) {
		const gl = this.gl;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	}

	private drawText(amplitude: number, frequency: number) {
		if (!this.font || !this.atlas || this.textIndexCount === 0) {
			return;
		}

		const gl = this.gl;
		gl.useProgram(this.textProgram);
		gl.uniform2f(
			getUniform(gl, this.textProgram, "u_resolution"),
			this.canvas.width,
			this.canvas.height,
		);
		gl.uniform1f(getUniform(gl, this.textProgram, "u_phase"), this.phase);
		gl.uniform1f(getUniform(gl, this.textProgram, "u_amplitude"), amplitude);
		gl.uniform1f(getUniform(gl, this.textProgram, "u_frequency"), frequency);
		gl.uniform2f(
			getUniform(gl, this.textProgram, "u_offset"),
			(this.canvas.width - this.textWidth) * 0.5,
			20 * this.dpr,
		);
		gl.uniform4f(getUniform(gl, this.textProgram, "u_color"), 0.97, 0.98, 1, 1);
		gl.uniform1f(
			getUniform(gl, this.textProgram, "u_pxRange"),
			this.font.distanceField.distanceRange,
		);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.atlas);
		gl.uniform1i(getUniform(gl, this.textProgram, "u_atlas"), 0);
		gl.activeTexture(gl.TEXTURE1);
		gl.bindTexture(gl.TEXTURE_2D, this.charTexture);
		gl.uniform1i(getUniform(gl, this.textProgram, "u_charTexture"), 1);
		gl.bindVertexArray(this.textVao);
		gl.drawElements(gl.TRIANGLES, this.textIndexCount, gl.UNSIGNED_SHORT, 0);
		gl.bindVertexArray(null);
	}

	private createBackgroundGeometry() {
		const gl = this.gl;
		const vao = requireVao(gl);

		gl.bindVertexArray(vao);
		bindAttribute(gl, 0, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), 2);
		bindAttribute(gl, 1, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2);
		gl.bindVertexArray(null);

		return vao;
	}

	private createLineGeometry() {
		const gl = this.gl;
		const segments = 768;
		const xs: number[] = [];
		const sides: number[] = [];
		const indices: number[] = [];

		for (let index = 0; index < segments; index += 1) {
			const t = index / (segments - 1);
			xs.push(t, t);
			sides.push(-1, 1);
		}

		for (let index = 0; index < segments - 1; index += 1) {
			const base = index * 2;
			indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
		}

		const vao = requireVao(gl);
		gl.bindVertexArray(vao);
		bindAttribute(gl, 0, new Float32Array(xs), 1);
		bindAttribute(gl, 1, new Float32Array(sides), 1);
		const ibo = requireBuffer(gl);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		gl.bindVertexArray(null);

		return { vao, indexCount: indices.length };
	}

	private createTextGeometry(text: string, scale: number, letterSpacing: number) {
		if (!this.font) {
			return;
		}

		const positions: number[] = [];
		const uvs: number[] = [];
		const indices: number[] = [];
		const glyphs = new Map(this.font.chars.map((glyph) => [glyph.char, glyph]));
		const gridX = 12;
		const gridY = 6;
		const baseline = this.font.common.base;
		const spaceAdvance = this.font.common.lineHeight * 0.25;
		let penX = 0;

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
			const u0 = glyph.x / this.font.common.scaleW;
			const v0 = glyph.y / this.font.common.scaleH;
			const u1 = (glyph.x + glyph.width) / this.font.common.scaleW;
			const v1 = (glyph.y + glyph.height) / this.font.common.scaleH;
			const baseIndex = positions.length / 2;

			for (let iy = 0; iy <= gridY; iy += 1) {
				const ty = iy / gridY;
				for (let ix = 0; ix <= gridX; ix += 1) {
					const tx = ix / gridX;
					positions.push(
						(gx0 + (gx1 - gx0) * tx) * scale * this.dpr,
						(gy0 + (gy1 - gy0) * ty) * scale * this.dpr,
					);
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

		this.textWidth = penX * scale * this.dpr;
		const gl = this.gl;
		gl.bindVertexArray(this.textVao);
		bindAttribute(gl, 0, new Float32Array(positions), 2);
		bindAttribute(gl, 1, new Float32Array(uvs), 2);
		const ibo = requireBuffer(gl);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
		gl.bindVertexArray(null);
		this.textIndexCount = indices.length;
	}
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
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

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
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

function getUniform(gl: WebGL2RenderingContext, program: WebGLProgram, name: string) {
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

function requireVao(gl: WebGL2RenderingContext) {
	const vao = gl.createVertexArray();

	if (!vao) {
		throw new Error("Could not create WebGL VAO.");
	}

	return vao;
}

function requireBuffer(gl: WebGL2RenderingContext) {
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
) {
	const buffer = requireBuffer(gl);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function loadTexture(gl: WebGL2RenderingContext, src: string) {
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

function hash1D(value: number) {
	return fract(Math.sin(value * 12.9898) * 43758.5453);
}

function fract(value: number) {
	return value - Math.floor(value);
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}
