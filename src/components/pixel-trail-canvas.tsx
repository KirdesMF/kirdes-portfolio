import { useEffect, useRef } from "react";

type PixelTrailCanvasProps = {
	charWidth?: number;
	charHeight?: number;
	mobileCharWidth?: number;
	mobileCharHeight?: number;
	fontSize?: number;
	mobileFontSize?: number;
	fontFamily?: string;
	charset?: string;
	atlasScale?: number;
	opacity?: number;
	radius?: number;
	damp?: number;
	strength?: number;
	pulseLife?: number;
	pulseStrength?: number;
	pulseWidth?: number;
	maxPulses?: number;
	color?: string;
	backgroundColor?: string;
	reducedMotion?: boolean;
	className?: string;
};

type GL = WebGLRenderingContext | WebGL2RenderingContext;

type Pointer = {
	previousX: number;
	previousY: number;
	currentX: number;
	currentY: number;
	active: boolean;
	needsReset: boolean;
};

type Pulse = {
	x: number;
	y: number;
	age: number;
	life: number;
};

type GlyphAtlas = {
	texture: WebGLTexture;
	gridWidth: number;
	gridHeight: number;
	glyphCount: number;
};

type GlyphAtlasContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const MAX_PULSES = 12;
const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
	v_uv = a_position * 0.5 + 0.5;
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const UPDATE_SHADER = `
precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_prevTrail;
uniform vec2 u_gridSize;
uniform vec2 u_cellAspect;
uniform vec2 u_prevPointer;
uniform vec2 u_currPointer;
uniform float u_pointerActive;
uniform float u_damp;
uniform float u_radius;
uniform float u_strength;
uniform int u_pulseCount;
uniform vec4 u_pulses[${MAX_PULSES}];
uniform vec4 u_pulseParams;

float distanceToSegment(vec2 point, vec2 a, vec2 b) {
	vec2 ab = b - a;
	float denom = dot(ab, ab);
	float t = denom > 0.0001 ? clamp(dot(point - a, ab) / denom, 0.0, 1.0) : 0.0;
	return length(point - (a + ab * t));
}

float easeOut(float t) {
	return 1.0 - pow(1.0 - clamp(t, 0.0, 1.0), 3.0);
}

void main() {
	vec2 cell = v_uv * u_gridSize;
	float nextValue = texture2D(u_prevTrail, v_uv).r * u_damp;

	float pointerDistance = distanceToSegment(cell * u_cellAspect, u_prevPointer * u_cellAspect, u_currPointer * u_cellAspect);
	float pointerInfluence = smoothstep(u_radius, 0.0, pointerDistance) * u_strength * u_pointerActive;
	nextValue = max(nextValue, pointerInfluence);

	float pulseWidth = u_pulseParams.x;
	float pulseMaxRadius = u_pulseParams.y;
	float pulseStrength = u_pulseParams.z;

	for (int i = 0; i < ${MAX_PULSES}; i++) {
		if (i >= u_pulseCount) break;
		vec4 pulse = u_pulses[i];
		float progress = clamp(pulse.z / pulse.w, 0.0, 1.0);
		float radius = easeOut(progress) * pulseMaxRadius;
		float ringDistance = abs(length((cell - pulse.xy) * u_cellAspect) - radius);
		float fadeOut = 1.0 - smoothstep(0.65, 1.0, progress);
		float ring = smoothstep(pulseWidth, 0.0, ringDistance) * fadeOut * pulseStrength;
		nextValue = max(nextValue, ring);
	}

	gl_FragColor = vec4(clamp(nextValue, 0.0, 1.0), 0.0, 0.0, 1.0);
}
`;

const RENDER_SHADER = `
precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_trail;
uniform sampler2D u_atlasTexture;
uniform vec2 u_gridSize;
uniform vec2 u_charSize;
uniform vec2 u_atlasGridSize;
uniform float u_glyphCount;
uniform vec3 u_color;
uniform vec3 u_backgroundColor;
uniform float u_hasBackground;
uniform float u_opacity;

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
	vec2 cell = floor(gl_FragCoord.xy / u_charSize);
	vec2 local = fract(gl_FragCoord.xy / u_charSize);
	vec2 trailUv = (cell + 0.5) / u_gridSize;
	float intensity = texture2D(u_trail, trailUv).r;
	if (trailUv.x < 0.0 || trailUv.x > 1.0 || trailUv.y < 0.0 || trailUv.y > 1.0) {
		discard;
	}

	float visibility = smoothstep(0.1, 0.22, intensity);
	if (visibility <= 0.0) {
		discard;
	}

	float normalized = pow(intensity, 1.35);
	float baseIndex = floor(normalized * (u_glyphCount - 1.0));
	float glyphIndex = clamp(baseIndex, 0.0, u_glyphCount - 1.0);
	vec2 glyphCell = vec2(mod(glyphIndex, u_atlasGridSize.x), floor(glyphIndex / u_atlasGridSize.x));
	vec2 atlasUv = (glyphCell + local) / u_atlasGridSize;
	atlasUv.y = 1.0 - atlasUv.y;

	float glyphAlpha = texture2D(u_atlasTexture, atlasUv).a;
	float variation = mix(0.8, 1.0, hash(cell + 19.17));
	float alpha = glyphAlpha * visibility * pow(intensity, 1.1) * variation * u_opacity;
	if (u_hasBackground > 0.5) {
		gl_FragColor = vec4(mix(u_backgroundColor, u_color, alpha), 1.0);
	} else {
		gl_FragColor = vec4(u_color, alpha);
	}
}
`;

const DEFAULTS = {
	charWidth: 8,
	charHeight: 14,
	mobileCharWidth: 10,
	mobileCharHeight: 16,
	fontSize: 13,
	mobileFontSize: 14,
	fontFamily: "Geist Mono Variable",
	charset: " @#-+::",
	atlasScale: 2,
	opacity: 0.55,
	radius: 3.75,
	damp: 0.955,
	strength: 1,
	pulseLife: 1,
	pulseStrength: 0.7,
	pulseWidth: 2.5,
	maxPulses: 8,
	color: "var(--muted-foreground)",
	backgroundColor: "transparent",
};

function compileShader(gl: GL, type: number, source: string) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl: GL, fragmentSource: string) {
	const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
	const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	if (!vertex || !fragment) return null;

	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		return null;
	}

	return program;
}

async function createGlyphAtlas(
	gl: GL,
	options: {
		charWidth: number;
		charHeight: number;
		fontSize: number;
		fontFamily: string;
		charset: string;
		atlasScale: number;
	},
): Promise<GlyphAtlas | null> {
	const fontFaceSet = document.fonts;
	const fontName = `"${options.fontFamily}"`;
	await fontFaceSet.load(`${options.fontSize * options.atlasScale}px ${fontName}`);
	await fontFaceSet.ready;

	const glyphCount = options.charset.length;
	const gridWidth = Math.ceil(Math.sqrt(glyphCount));
	const gridHeight = Math.ceil(glyphCount / gridWidth);
	const cellWidth = options.charWidth * options.atlasScale;
	const cellHeight = options.charHeight * options.atlasScale;
	const atlasWidth = gridWidth * cellWidth;
	const atlasHeight = gridHeight * cellHeight;
	const atlasCanvas =
		typeof OffscreenCanvas === "undefined"
			? document.createElement("canvas")
			: new OffscreenCanvas(atlasWidth, atlasHeight);
	atlasCanvas.width = atlasWidth;
	atlasCanvas.height = atlasHeight;

	const context = atlasCanvas.getContext("2d") as GlyphAtlasContext | null;
	if (!context) return null;
	context.clearRect(0, 0, atlasWidth, atlasHeight);
	context.fillStyle = "white";
	context.textAlign = "center";
	context.textBaseline = "middle";
	context.font = `${options.fontSize * options.atlasScale}px ${fontName}, monospace`;

	for (let index = 0; index < glyphCount; index++) {
		const col = index % gridWidth;
		const row = Math.floor(index / gridWidth);
		context.fillText(
			options.charset[index],
			col * cellWidth + cellWidth / 2,
			row * cellHeight + cellHeight / 2,
		);
	}

	const texture = gl.createTexture();
	if (!texture) return null;
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas);

	return { texture, gridWidth, gridHeight, glyphCount };
}

function createTrailTarget(gl: GL, width: number, height: number) {
	const texture = gl.createTexture();
	const framebuffer = gl.createFramebuffer();
	if (!texture || !framebuffer) return null;

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	return { texture, framebuffer };
}

function setQuad(gl: GL, program: WebGLProgram, buffer: WebGLBuffer) {
	const location = gl.getAttribLocation(program, "a_position");
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
}

function activateProgram(gl: GL, program: WebGLProgram) {
	const methodName = "useProgram";
	gl[methodName](program);
}

function resolveColor(element: HTMLElement, value: string): [number, number, number] | null {
	if (value === "transparent") return [0, 0, 0];

	const styles = getComputedStyle(element);
	const resolved = value.replace(/var\((--[^)]+)\)/g, (_, name: string) =>
		styles.getPropertyValue(name).trim(),
	);
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d");
	if (!context) return null;
	context.clearRect(0, 0, 1, 1);
	context.fillStyle = resolved;
	context.fillRect(0, 0, 1, 1);
	const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
	return [red / 255, green / 255, blue / 255];
}

function isMobileViewport() {
	return window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
}

export function PixelTrailCanvas(props: PixelTrailCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		let reducedMotion = props.reducedMotion ?? reducedMotionQuery.matches;
		const contextAttributes: WebGLContextAttributes = { alpha: true };
		const webgl2Context = canvas.getContext("webgl2", contextAttributes);
		const context: GL | null = webgl2Context ?? canvas.getContext("webgl", contextAttributes);
		if (!context) return;
		const renderer = context;
		const canvasElement = canvas;

		const maybeUpdateShaderProgram = createProgram(renderer, UPDATE_SHADER);
		const maybeRenderShaderProgram = createProgram(renderer, RENDER_SHADER);
		const maybeQuadBuffer = renderer.createBuffer();
		if (!maybeUpdateShaderProgram || !maybeRenderShaderProgram || !maybeQuadBuffer) return;
		const resources: {
			updateShaderProgram: WebGLProgram;
			renderShaderProgram: WebGLProgram;
			quadBuffer: WebGLBuffer;
		} = {
			updateShaderProgram: maybeUpdateShaderProgram,
			renderShaderProgram: maybeRenderShaderProgram,
			quadBuffer: maybeQuadBuffer,
		};
		const { updateShaderProgram, renderShaderProgram, quadBuffer } = resources;
		const updateUniforms = {
			prevTrail: renderer.getUniformLocation(updateShaderProgram, "u_prevTrail"),
			gridSize: renderer.getUniformLocation(updateShaderProgram, "u_gridSize"),
			cellAspect: renderer.getUniformLocation(updateShaderProgram, "u_cellAspect"),
			prevPointer: renderer.getUniformLocation(updateShaderProgram, "u_prevPointer"),
			currPointer: renderer.getUniformLocation(updateShaderProgram, "u_currPointer"),
			pointerActive: renderer.getUniformLocation(updateShaderProgram, "u_pointerActive"),
			damp: renderer.getUniformLocation(updateShaderProgram, "u_damp"),
			radius: renderer.getUniformLocation(updateShaderProgram, "u_radius"),
			strength: renderer.getUniformLocation(updateShaderProgram, "u_strength"),
			pulseCount: renderer.getUniformLocation(updateShaderProgram, "u_pulseCount"),
			pulses: renderer.getUniformLocation(updateShaderProgram, "u_pulses[0]"),
			pulseParams: renderer.getUniformLocation(updateShaderProgram, "u_pulseParams"),
		};
		const renderUniforms = {
			trail: renderer.getUniformLocation(renderShaderProgram, "u_trail"),
			atlasTexture: renderer.getUniformLocation(renderShaderProgram, "u_atlasTexture"),
			gridSize: renderer.getUniformLocation(renderShaderProgram, "u_gridSize"),
			charSize: renderer.getUniformLocation(renderShaderProgram, "u_charSize"),
			atlasGridSize: renderer.getUniformLocation(renderShaderProgram, "u_atlasGridSize"),
			glyphCount: renderer.getUniformLocation(renderShaderProgram, "u_glyphCount"),
			opacity: renderer.getUniformLocation(renderShaderProgram, "u_opacity"),
			color: renderer.getUniformLocation(renderShaderProgram, "u_color"),
			backgroundColor: renderer.getUniformLocation(renderShaderProgram, "u_backgroundColor"),
			hasBackground: renderer.getUniformLocation(renderShaderProgram, "u_hasBackground"),
		};
		const pulseUniforms = new Float32Array(MAX_PULSES * 4);

		renderer.bindBuffer(renderer.ARRAY_BUFFER, quadBuffer);
		renderer.bufferData(
			renderer.ARRAY_BUFFER,
			new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
			renderer.STATIC_DRAW,
		);
		renderer.disable(renderer.DEPTH_TEST);
		renderer.disable(renderer.BLEND);
		renderer.bindFramebuffer(renderer.FRAMEBUFFER, null);
		renderer.clearColor(0, 0, 0, 0);
		renderer.clear(renderer.COLOR_BUFFER_BIT);

		let width = 1;
		let height = 1;
		let charWidth = DEFAULTS.charWidth;
		let charHeight = DEFAULTS.charHeight;
		let charAspectX = DEFAULTS.charWidth / DEFAULTS.charHeight;
		let cols = 1;
		let rows = 1;
		let readTarget: ReturnType<typeof createTrailTarget> | null = null;
		let writeTarget: ReturnType<typeof createTrailTarget> | null = null;
		let frame = 0;
		let lastTime = performance.now();
		let visible = true;
		let inViewport = true;
		let effectColor: [number, number, number] = [1, 1, 1];
		let effectBackgroundColor: [number, number, number] = [0, 0, 0];
		let glyphAtlas: GlyphAtlas | null = null;
		let glyphAtlasKey = "";
		let disposed = false;
		const pulses: Pulse[] = [];
		const pointer: Pointer = {
			previousX: 0,
			previousY: 0,
			currentX: 0,
			currentY: 0,
			active: false,
			needsReset: true,
		};

		const config = () => {
			const mobile = isMobileViewport();
			return {
				charWidth: mobile
					? (props.mobileCharWidth ?? DEFAULTS.mobileCharWidth)
					: (props.charWidth ?? DEFAULTS.charWidth),
				charHeight: mobile
					? (props.mobileCharHeight ?? DEFAULTS.mobileCharHeight)
					: (props.charHeight ?? DEFAULTS.charHeight),
				fontSize: mobile
					? (props.mobileFontSize ?? DEFAULTS.mobileFontSize)
					: (props.fontSize ?? DEFAULTS.fontSize),
				fontFamily: props.fontFamily ?? DEFAULTS.fontFamily,
				charset: props.charset ?? DEFAULTS.charset,
				atlasScale: props.atlasScale ?? DEFAULTS.atlasScale,
				opacity: props.opacity ?? DEFAULTS.opacity,
				radius: reducedMotion ? 2.75 : (props.radius ?? (mobile ? 3.25 : DEFAULTS.radius)),
				damp: reducedMotion ? 0.92 : (props.damp ?? (mobile ? 0.945 : DEFAULTS.damp)),
				strength: reducedMotion ? 0.35 : (props.strength ?? (mobile ? 0.8 : DEFAULTS.strength)),
				pulseLife: props.pulseLife ?? (mobile ? 0.85 : DEFAULTS.pulseLife),
				pulseStrength: reducedMotion
					? 0.25
					: (props.pulseStrength ?? (mobile ? 0.6 : DEFAULTS.pulseStrength)),
				pulseWidth: props.pulseWidth ?? (mobile ? 2 : DEFAULTS.pulseWidth),
				maxPulses: Math.min(props.maxPulses ?? (mobile ? 4 : DEFAULTS.maxPulses), MAX_PULSES),
				dprMax: mobile ? 1.5 : 2,
			};
		};

		function disposeTargets() {
			for (const target of [readTarget, writeTarget]) {
				if (!target) continue;
				renderer.deleteTexture(target.texture);
				renderer.deleteFramebuffer(target.framebuffer);
			}
			readTarget = null;
			writeTarget = null;
		}

		async function ensureGlyphAtlas(next: ReturnType<typeof config>) {
			const key = `${next.charWidth}:${next.charHeight}:${next.fontSize}:${next.fontFamily}:${next.charset}:${next.atlasScale}`;
			if (glyphAtlasKey === key && glyphAtlas) return;
			glyphAtlasKey = key;
			const previousAtlas = glyphAtlas;
			const nextAtlas = await createGlyphAtlas(renderer, next);
			if (disposed) {
				if (nextAtlas) renderer.deleteTexture(nextAtlas.texture);
				return;
			}
			if (!nextAtlas) return;
			glyphAtlas = nextAtlas;
			if (previousAtlas) renderer.deleteTexture(previousAtlas.texture);
			if (!frame && visible && inViewport) frame = window.requestAnimationFrame(render);
		}

		function updateEffectColors() {
			effectColor = resolveColor(canvasElement, props.color ?? DEFAULTS.color) ?? [1, 1, 1];
			effectBackgroundColor = resolveColor(
				canvasElement,
				props.backgroundColor ?? DEFAULTS.backgroundColor,
			) ?? [0, 0, 0];
		}

		function resize() {
			const next = config();
			const rect = canvasElement.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, next.dprMax);
			width = Math.max(1, Math.floor(rect.width * dpr));
			height = Math.max(1, Math.floor(rect.height * dpr));
			charWidth = next.charWidth * dpr;
			charHeight = next.charHeight * dpr;
			charAspectX = next.charWidth / next.charHeight;
			cols = Math.max(1, Math.ceil(width / charWidth));
			rows = Math.max(1, Math.ceil(height / charHeight));
			canvasElement.width = width;
			canvasElement.height = height;
			updateEffectColors();

			disposeTargets();
			readTarget = createTrailTarget(renderer, cols, rows);
			writeTarget = createTrailTarget(renderer, cols, rows);
			void ensureGlyphAtlas(next);
		}

		function pointerToGrid(event: PointerEvent) {
			const rect = canvasElement.getBoundingClientRect();
			const dprX = width / Math.max(rect.width, 1);
			const dprY = height / Math.max(rect.height, 1);
			return {
				x: ((event.clientX - rect.left) * dprX) / charWidth,
				y: (height - (event.clientY - rect.top) * dprY) / charHeight,
			};
		}

		function onPointerMove(event: PointerEvent) {
			const point = pointerToGrid(event);
			if (pointer.needsReset) {
				pointer.previousX = point.x;
				pointer.previousY = point.y;
				pointer.needsReset = false;
			} else {
				pointer.previousX = pointer.currentX;
				pointer.previousY = pointer.currentY;
			}
			pointer.currentX = point.x;
			pointer.currentY = point.y;
			pointer.active = true;
		}

		function onPointerLeave() {
			pointer.needsReset = true;
			pointer.active = false;
		}

		function onPointerDown(event: PointerEvent) {
			const next = config();
			const point = pointerToGrid(event);
			pulses.push({ x: point.x, y: point.y, age: 0, life: next.pulseLife });
			while (pulses.length > next.maxPulses) pulses.shift();
			onPointerMove(event);
		}

		function render(now: number) {
			frame = 0;
			if (!visible || !inViewport || !readTarget || !writeTarget || !glyphAtlas) return;

			const delta = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;
			const next = config();
			for (let i = pulses.length - 1; i >= 0; i--) {
				pulses[i].age += delta;
				if (pulses[i].age >= pulses[i].life) pulses.splice(i, 1);
			}

			activateProgram(renderer, updateShaderProgram);
			setQuad(renderer, updateShaderProgram, quadBuffer);
			renderer.viewport(0, 0, cols, rows);
			renderer.bindFramebuffer(renderer.FRAMEBUFFER, writeTarget.framebuffer);
			renderer.activeTexture(renderer.TEXTURE0);
			renderer.bindTexture(renderer.TEXTURE_2D, readTarget.texture);
			renderer.uniform1i(updateUniforms.prevTrail, 0);
			renderer.uniform2f(updateUniforms.gridSize, cols, rows);
			renderer.uniform2f(updateUniforms.cellAspect, charAspectX, 1);
			renderer.uniform2f(updateUniforms.prevPointer, pointer.previousX, pointer.previousY);
			renderer.uniform2f(updateUniforms.currPointer, pointer.currentX, pointer.currentY);
			renderer.uniform1f(updateUniforms.pointerActive, pointer.active ? 1 : 0);
			renderer.uniform1f(updateUniforms.damp, next.damp ** (delta * 60));
			renderer.uniform1f(updateUniforms.radius, next.radius);
			renderer.uniform1f(updateUniforms.strength, next.strength);
			renderer.uniform1i(updateUniforms.pulseCount, pulses.length);
			pulseUniforms.fill(0);
			for (let i = 0; i < pulses.length; i++) {
				const offset = i * 4;
				pulseUniforms[offset] = pulses[i].x;
				pulseUniforms[offset + 1] = pulses[i].y;
				pulseUniforms[offset + 2] = pulses[i].age;
				pulseUniforms[offset + 3] = pulses[i].life;
			}
			renderer.uniform4fv(updateUniforms.pulses, pulseUniforms);
			renderer.uniform4f(
				updateUniforms.pulseParams,
				next.pulseWidth,
				Math.min(cols, rows) * 0.35,
				next.pulseStrength,
				0,
			);
			renderer.drawArrays(renderer.TRIANGLE_STRIP, 0, 4);
			[readTarget, writeTarget] = [writeTarget, readTarget];

			const background = props.backgroundColor ?? DEFAULTS.backgroundColor;

			activateProgram(renderer, renderShaderProgram);
			setQuad(renderer, renderShaderProgram, quadBuffer);
			renderer.viewport(0, 0, width, height);
			renderer.bindFramebuffer(renderer.FRAMEBUFFER, null);
			renderer.clearColor(
				effectBackgroundColor[0],
				effectBackgroundColor[1],
				effectBackgroundColor[2],
				background === "transparent" ? 0 : 1,
			);
			renderer.clear(renderer.COLOR_BUFFER_BIT);
			renderer.activeTexture(renderer.TEXTURE0);
			renderer.bindTexture(renderer.TEXTURE_2D, readTarget.texture);
			renderer.uniform1i(renderUniforms.trail, 0);
			renderer.activeTexture(renderer.TEXTURE1);
			renderer.bindTexture(renderer.TEXTURE_2D, glyphAtlas.texture);
			renderer.uniform1i(renderUniforms.atlasTexture, 1);
			renderer.uniform2f(renderUniforms.gridSize, cols, rows);
			renderer.uniform2f(renderUniforms.charSize, charWidth, charHeight);
			renderer.uniform2f(renderUniforms.atlasGridSize, glyphAtlas.gridWidth, glyphAtlas.gridHeight);
			renderer.uniform1f(renderUniforms.glyphCount, glyphAtlas.glyphCount);
			renderer.uniform1f(renderUniforms.opacity, next.opacity);
			renderer.uniform3f(renderUniforms.color, effectColor[0], effectColor[1], effectColor[2]);
			renderer.uniform3f(
				renderUniforms.backgroundColor,
				effectBackgroundColor[0],
				effectBackgroundColor[1],
				effectBackgroundColor[2],
			);
			renderer.uniform1f(renderUniforms.hasBackground, background === "transparent" ? 0 : 1);
			renderer.drawArrays(renderer.TRIANGLE_STRIP, 0, 4);

			pointer.active = false;
			frame = window.requestAnimationFrame(render);
		}

		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvasElement);
		resize();

		const themeObserver = new MutationObserver(() => {
			updateEffectColors();
		});
		themeObserver.observe(document.documentElement, {
			attributeFilter: ["class", "data-mode", "data-theme", "style"],
			attributes: true,
		});

		const intersectionObserver = new IntersectionObserver(([entry]) => {
			inViewport = entry?.isIntersecting ?? true;
			if (inViewport && !frame) {
				lastTime = performance.now();
				frame = window.requestAnimationFrame(render);
			}
		});
		intersectionObserver.observe(canvasElement);

		function onVisibilityChange() {
			visible = document.visibilityState === "visible";
			if (visible && !frame) {
				lastTime = performance.now();
				frame = window.requestAnimationFrame(render);
			}
		}

		function onReducedMotionChange(event: MediaQueryListEvent) {
			reducedMotion = props.reducedMotion ?? event.matches;
		}

		window.addEventListener("pointermove", onPointerMove, { passive: true });
		window.addEventListener("pointerdown", onPointerDown, { passive: true });
		document.addEventListener("mouseleave", onPointerLeave);
		document.addEventListener("visibilitychange", onVisibilityChange);
		reducedMotionQuery.addEventListener("change", onReducedMotionChange);
		frame = window.requestAnimationFrame(render);

		return () => {
			disposed = true;
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerdown", onPointerDown);
			document.removeEventListener("mouseleave", onPointerLeave);
			document.removeEventListener("visibilitychange", onVisibilityChange);
			reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
			resizeObserver.disconnect();
			themeObserver.disconnect();
			intersectionObserver.disconnect();
			if (frame) window.cancelAnimationFrame(frame);
			disposeTargets();
			if (glyphAtlas) renderer.deleteTexture(glyphAtlas.texture);
			renderer.deleteBuffer(quadBuffer);
			renderer.deleteProgram(updateShaderProgram);
			renderer.deleteProgram(renderShaderProgram);
		};
	}, [props]);

	return <canvas className={`touch-none bg-background ${props.className ?? ""}`} ref={canvasRef} />;
}
