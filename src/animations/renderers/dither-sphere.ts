/* biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook. */
import { AnimationTheme, toUnitRgb } from "../theme";
import { createWebGLProgram, requireWebGLBuffer, requireWebGLUniform } from "../webgl/helpers";

const vertexShaderSource = `#version 300 es
in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Adapted from Paper Shaders' dithering sphere with the 4x4 Bayer type.
const fragmentShaderSource = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform vec2 u_pointer;
uniform vec2 u_autoPointer;
uniform float u_pointerActive;
uniform float u_autoStartTime;
uniform float u_interactionStartTime;
uniform vec3 u_background;
uniform vec3 u_color;

out vec4 fragColor;

const int bayer4x4[16] = int[16](
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
);

float getBayerValue(vec2 uv) {
  ivec2 pos = ivec2(fract(uv / 4.0) * 4.0);
  int index = pos.y * 4 + pos.x;
  return float(bayer4x4[index]) / 16.0;
}

void main() {
  float t = 0.5 * u_time;
  float pxSize = 4.0 * u_pixelRatio;
  vec2 pxSizeUV = (gl_FragCoord.xy - 0.5 * u_resolution) / pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + 0.5) * pxSize;
  vec2 shapeUV = canvasPixelizedUV / min(u_resolution.x, u_resolution.y);

  shapeUV *= 3.4;

  float d = 1.0 - pow(length(shapeUV), 2.0);
  vec3 pos = vec3(shapeUV, sqrt(max(0.0, d)));
  vec3 initialAutomaticLight = normalize(vec3(cos(1.5 * t), 0.8, sin(1.25 * t)));
  vec3 pointerLight = normalize(vec3(-u_pointer, -0.8));
  vec3 lastPointerLight = normalize(vec3(-u_autoPointer, -0.8));
  float orbitAngle = max(0.0, u_time - u_autoStartTime) * 0.7;
  float orbitCos = cos(orbitAngle);
  float orbitSin = sin(orbitAngle);
  vec3 continuedAutomaticLight = vec3(
    orbitCos * lastPointerLight.x + orbitSin * lastPointerLight.z,
    lastPointerLight.y,
    -orbitSin * lastPointerLight.x + orbitCos * lastPointerLight.z
  );
  vec3 automaticLight = u_autoStartTime < 0.0
    ? initialAutomaticLight
    : continuedAutomaticLight;
  float interactionMix = u_pointerActive * smoothstep(
    0.0,
    0.45,
    max(0.0, u_time - u_interactionStartTime)
  );
  vec3 lightPos = normalize(mix(automaticLight, pointerLight, interactionMix));
  float shape = 0.5 + 0.5 * dot(lightPos, pos);
  shape *= step(0.0, d);

  float dithering = getBayerValue(pxSizeUV) - 0.5;
  float result = step(0.5, shape + dithering);
  fragColor = vec4(mix(u_background, u_color, result), 1.0);
}
`;

const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);

export class DitherSphereRenderer {
	private readonly gl: WebGL2RenderingContext;
	private readonly program: WebGLProgram;
	private readonly vertexBuffer: WebGLBuffer;
	private readonly positionLocation: number;
	private readonly timeLocation: WebGLUniformLocation;
	private readonly resolutionLocation: WebGLUniformLocation;
	private readonly pixelRatioLocation: WebGLUniformLocation;
	private readonly pointerLocation: WebGLUniformLocation;
	private readonly autoPointerLocation: WebGLUniformLocation;
	private readonly pointerActiveLocation: WebGLUniformLocation;
	private readonly autoStartTimeLocation: WebGLUniformLocation;
	private readonly interactionStartTimeLocation: WebGLUniformLocation;
	private readonly backgroundLocation: WebGLUniformLocation;
	private readonly colorLocation: WebGLUniformLocation;
	private readonly abortController = new AbortController();
	private readonly theme: AnimationTheme;
	private dpr = 1;
	private pointerX = 0;
	private pointerY = 0;
	private autoPointerX = 0;
	private autoPointerY = 0;
	private pointerActive = false;
	private autoStartTime = -1;
	private interactionStartTime = 0;

	constructor(private readonly canvas: HTMLCanvasElement) {
		const gl = canvas.getContext("webgl2", {
			alpha: false,
			antialias: false,
			depth: false,
			stencil: false,
			powerPreference: "high-performance",
		});

		if (!gl) {
			throw new Error("WebGL2 is not supported in this browser.");
		}

		this.gl = gl;
		this.program = createWebGLProgram(gl, vertexShaderSource, fragmentShaderSource);
		this.vertexBuffer = requireWebGLBuffer(gl);
		this.positionLocation = gl.getAttribLocation(this.program, "a_position");
		this.timeLocation = requireWebGLUniform(gl, this.program, "u_time");
		this.resolutionLocation = requireWebGLUniform(gl, this.program, "u_resolution");
		this.pixelRatioLocation = requireWebGLUniform(gl, this.program, "u_pixelRatio");
		this.pointerLocation = requireWebGLUniform(gl, this.program, "u_pointer");
		this.autoPointerLocation = requireWebGLUniform(gl, this.program, "u_autoPointer");
		this.pointerActiveLocation = requireWebGLUniform(gl, this.program, "u_pointerActive");
		this.autoStartTimeLocation = requireWebGLUniform(gl, this.program, "u_autoStartTime");
		this.interactionStartTimeLocation = requireWebGLUniform(
			gl,
			this.program,
			"u_interactionStartTime",
		);
		this.backgroundLocation = requireWebGLUniform(gl, this.program, "u_background");
		this.colorLocation = requireWebGLUniform(gl, this.program, "u_color");
		this.theme = new AnimationTheme(canvas);

		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(this.positionLocation);
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

		const { signal } = this.abortController;
		canvas.addEventListener("pointermove", (event) => this.updatePointer(event), { signal });
		canvas.addEventListener("pointerenter", (event) => this.updatePointer(event), { signal });
		canvas.addEventListener(
			"pointerleave",
			() => {
				this.pointerActive = false;
				this.autoPointerX = this.pointerX;
				this.autoPointerY = this.pointerY;
				this.autoStartTime = performance.now() * 0.001;
			},
			{ signal },
		);
	}

	resize() {
		const rect = this.canvas.getBoundingClientRect();
		this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
		const width = Math.max(1, Math.round(rect.width * this.dpr));
		const height = Math.max(1, Math.round(rect.height * this.dpr));

		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
			this.gl.viewport(0, 0, width, height);
		}
	}

	render(timestamp: number) {
		const { gl } = this;

		gl.useProgram(this.program);
		gl.uniform1f(this.timeLocation, timestamp * 0.001);
		gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
		gl.uniform1f(this.pixelRatioLocation, this.dpr);
		gl.uniform2f(this.pointerLocation, this.pointerX, this.pointerY);
		gl.uniform2f(this.autoPointerLocation, this.autoPointerX, this.autoPointerY);
		gl.uniform1f(this.pointerActiveLocation, this.pointerActive ? 1 : 0);
		gl.uniform1f(this.autoStartTimeLocation, this.autoStartTime);
		gl.uniform1f(this.interactionStartTimeLocation, this.interactionStartTime);
		gl.uniform3fv(this.backgroundLocation, toUnitRgb(this.theme.palette.background));
		gl.uniform3fv(this.colorLocation, toUnitRgb(this.theme.palette.text));
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	dispose() {
		this.abortController.abort();
		this.theme.dispose();
		this.gl.deleteBuffer(this.vertexBuffer);
		this.gl.deleteProgram(this.program);
	}

	private updatePointer(event: PointerEvent) {
		const rect = this.canvas.getBoundingClientRect();
		this.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		this.pointerY = 1 - ((event.clientY - rect.top) / rect.height) * 2;

		if (!this.pointerActive) {
			this.interactionStartTime = performance.now() * 0.001;
		}

		this.pointerActive = true;
	}
}
