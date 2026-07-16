/* biome-ignore-all lint/correctness/useHookAtTopLevel: WebGL useProgram is not a React hook. */
import { useEffect, useRef } from "react";

import { type AnimationRenderer, startAnimationLoop } from "./animation-loop";
import {
	AnimationTheme,
	DEFAULT_ANIMATION_PALETTE,
	getAnimationPalette,
	parseRgbColor,
} from "./theme";

export type EffectMode =
	| "scramble"
	| "spotlight"
	| "spotlight-hidden"
	| "god-light"
	| "corner-sunburst"
	| "elastic"
	| "scanline"
	| "spring-mesh"
	| "interference"
	| "radar-halo"
	| "dither-eye"
	| "dither-smoke"
	| "char-eye"
	| "ascii-topographic"
	| "ascii-fluid";

type TextRow = {
	chars: string[];
	mutations: Map<number, number>;
	original: string;
	x: number;
	offset: number;
	velocity: number;
};

type Burst = {
	startedAt: number;
	x: number;
	y: number;
};

type PointerState = {
	active: boolean;
	down: boolean;
	x: number;
	y: number;
};

const TEXT_SIZE = 10;
const LINE_HEIGHT = 13;

const MUTATION_CHARS = "    ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TEXTURE_FRAME_INTERVAL = 1000 / 12;
const MUTATION_MIN_DURATION = 260;
const MUTATION_MAX_DURATION = 900;
const BURST_DURATION = 2400;
const BURST_LOCAL_DURATION = 720;
const BURST_LOCAL_RADIUS = 140;
const BURST_RING_WIDTH = 0.2;
const BURST_ACTIVATION_STRENGTH = 1.18;
const TEXT_PHRASES = [
	"CEDRIC GOURVILLE PORTFOLIO 2026",
	"SOFTWARE ENGINEER",
	"FRONTEND ANIMATION MOTION",
	"THE FUTURE IS FOR US",
	"WEBGL TYPOGRAPHY SYSTEMS",
	"INTERACTIVE INTERFACES",
	"PIXELS SHADERS CANVAS",
	"DESIGN TECHNOLOGY",
	"CREATIVE DEVELOPMENT",
	"DIGITAL EXPERIENCES",
	"REAL TIME GRAPHICS",
	"CODE AS MATERIAL",
];
const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_uv;

varying vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform sampler2D u_texture;

varying vec2 v_uv;

void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}
`;

const vertexData = new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, 1, 1, 1, 0]);

export class TextCanvasRenderer {
	private rows: TextRow[] = [];
	private bursts: Burst[] = [];
	private glyphWidth = this.getTextSize() * 0.62;
	private width = 1;
	private height = 1;
	private dpr = 1;
	private visible = true;
	private palette = DEFAULT_ANIMATION_PALETTE;
	private lastTextureFrameTime = 0;
	private spotlightRadius = 0;
	private spotlightRadiusLastTimestamp = 0;
	private radarHaloAngle = 0;
	private radarHaloLastTimestamp = 0;
	private radarHaloHold = 0;
	private radarHaloAngularVelocity = 0;
	private scanlineY = -90;
	private scanlineDirection = 1;
	private scanlineLastTimestamp = 0;
	private scanlineHold = 0;
	private scanlineVelocity = 0;
	private readonly gl: WebGLRenderingContext;
	private readonly context: CanvasRenderingContext2D;
	private readonly offscreenCanvas = document.createElement("canvas");
	private readonly scene: CanvasTextureScene;
	private readonly texture: WebGLTexture;
	private readonly abortController = new AbortController();
	private readonly themeObserver: MutationObserver;
	private readonly pointer: PointerState = {
		active: false,
		down: false,
		x: -9999,
		y: -9999,
	};

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly mode: EffectMode,
	) {
		this.gl = requireWebGLContext(canvas);
		this.context = require2DContext(this.offscreenCanvas);
		this.scene = createCanvasTextureScene(this.gl);
		this.texture = this.scene.texture;
		this.themeObserver = new MutationObserver(() => {
			this.palette = getAnimationPalette(this.canvas);
		});
		this.themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme"],
		});
		this.bindEvents();
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

		this.width = width;
		this.height = height;
		this.dpr = dpr;
		this.palette = getAnimationPalette(this.canvas);
		this.offscreenCanvas.width = this.canvas.width;
		this.offscreenCanvas.height = this.canvas.height;

		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.rebuildRows();
		this.drawTextTexture(0);
	}

	render(timestamp: number) {
		if (!this.visible) {
			return;
		}

		if (timestamp - this.lastTextureFrameTime < TEXTURE_FRAME_INTERVAL) return;

		this.drawTextTexture(timestamp);
		this.lastTextureFrameTime = timestamp;
		const clear = parseRgbColor(this.palette.background);
		this.gl.clearColor(clear.r / 255, clear.g / 255, clear.b / 255, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	dispose() {
		this.abortController.abort();
		this.themeObserver.disconnect();
		this.scene.dispose();
	}

	private bindEvents() {
		const { signal } = this.abortController;
		const clearInteraction = () => {
			this.pointer.active = false;
			this.pointer.down = false;
			this.spotlightRadius = 0;
			this.bursts = [];
		};

		this.canvas.addEventListener("pointermove", (event) => this.setPointerFromViewport(event), {
			signal,
		});
		this.canvas.addEventListener("pointerenter", (event) => this.setPointerFromViewport(event), {
			signal,
		});
		this.canvas.addEventListener(
			"pointerleave",
			() => {
				this.pointer.active = false;
				this.pointer.down = false;
			},
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerdown",
			(event) => {
				this.setPointerFromViewport(event);
				this.pointer.down = true;
				this.bursts.push({
					startedAt: performance.now(),
					x: this.pointer.x,
					y: this.pointer.y,
				});

				if (this.bursts.length > 8) {
					this.bursts.shift();
				}
			},
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerup",
			() => {
				this.pointer.down = false;
			},
			{ signal },
		);
		window.addEventListener("blur", clearInteraction, { signal });
		document.addEventListener(
			"visibilitychange",
			() => {
				if (document.visibilityState !== "visible") clearInteraction();
			},
			{ signal },
		);
	}

	private setPointerFromViewport(event: PointerEvent) {
		const rect = this.canvas.getBoundingClientRect();
		const active =
			event.clientX >= rect.left &&
			event.clientX <= rect.right &&
			event.clientY >= rect.top &&
			event.clientY <= rect.bottom;

		this.pointer.active = active;
		this.pointer.x = event.clientX - rect.left;
		this.pointer.y = event.clientY - rect.top;

		if (!active) {
			this.pointer.down = false;
		}
	}

	private getTextSize() {
		return this.mode === "scramble" ? 12 : TEXT_SIZE;
	}

	private getLineHeight() {
		return this.mode === "scramble" ? 17 : LINE_HEIGHT;
	}

	private getFont() {
		return `${this.mode === "scramble" ? 600 : 400} ${this.getTextSize()}px "Geist Mono", monospace`;
	}

	private rebuildRows() {
		this.context.font = this.getFont();
		this.glyphWidth = this.context.measureText("0").width || this.glyphWidth;
		this.rows = [];

		for (
			let rowIndex = 0, y = 0;
			y < this.height + this.getLineHeight();
			rowIndex += 1, y += this.getLineHeight()
		) {
			const { line, x } = this.buildFullWidthLine(rowIndex);

			this.rows.push({
				chars: [...line],
				mutations: new Map(),
				original: line,
				x,
				offset: 0,
				velocity: 0,
			});
		}
	}

	private drawTextTexture(timestamp: number) {
		this.updateSpotlightRadius(timestamp);
		this.updateMutations(timestamp);
		this.updateBursts(timestamp);
		this.updateElasticRows();
		this.updateRadarHalo(timestamp);
		this.updateScanline(timestamp);

		this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.context.fillStyle = this.palette.background;
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.font = this.getFont();
		this.context.textBaseline = "top";

		for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex += 1) {
			this.drawRow(this.rows[rowIndex], rowIndex, timestamp);
		}

		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			this.offscreenCanvas,
		);
	}

	private drawRow(row: TextRow, rowIndex: number, timestamp: number) {
		if (this.mode === "scramble") {
			this.drawScrambleRow(row, rowIndex, timestamp);
			return;
		}

		if (this.mode === "spring-mesh") {
			this.drawSpringMeshRow(row, rowIndex, timestamp);
			return;
		}

		for (let charIndex = 0; charIndex < row.original.length; charIndex += 1) {
			const x = row.x + row.offset + charIndex * this.glyphWidth;

			if (x < -this.glyphWidth || x > this.width + this.glyphWidth) {
				continue;
			}

			const y = rowIndex * this.getLineHeight();
			const state = this.getCellState(
				x + this.glyphWidth * 0.5,
				y + this.getLineHeight() * 0.5,
				charIndex,
				rowIndex,
				timestamp,
			);
			this.context.globalAlpha = state.alpha;
			this.context.fillStyle = state.color;
			this.context.fillText(state.char, x, y);
			this.context.globalAlpha = 1;
		}
	}

	private drawScrambleRow(row: TextRow, rowIndex: number, timestamp: number) {
		const y = rowIndex * this.getLineHeight();

		this.context.globalAlpha = 0.18;
		this.context.fillStyle = this.palette.text;
		this.context.fillText(row.chars.join(""), row.x, y);
		this.context.globalAlpha = 1;

		for (let charIndex = 0; charIndex < row.chars.length; charIndex += 1) {
			const x = row.x + charIndex * this.glyphWidth;
			const cell = this.getScrambleCellState(
				x + this.glyphWidth * 0.5,
				y + this.getLineHeight() * 0.5,
				charIndex,
				rowIndex,
				timestamp,
			);

			if (!cell.active) {
				continue;
			}

			this.context.fillStyle = this.palette.background;
			this.context.fillRect(x - 0.5, y, this.glyphWidth + 1, this.getLineHeight());
			this.context.globalAlpha = 0.55 + cell.strength * 0.45;
			this.context.fillStyle = this.palette.text;
			this.context.fillText(
				getMutationCharForTime(row.original[charIndex], charIndex, rowIndex, timestamp, 74),
				x,
				y,
			);
			this.context.globalAlpha = 1;
		}
	}

	private drawSpringMeshRow(row: TextRow, rowIndex: number, timestamp: number) {
		const y = rowIndex * this.getLineHeight();

		for (let charIndex = 0; charIndex < row.original.length; charIndex += 1) {
			const x = row.x + row.offset + charIndex * this.glyphWidth;

			if (x < -this.glyphWidth || x > this.width + this.glyphWidth) {
				continue;
			}

			const centerX = x + this.glyphWidth * 0.5;
			const centerY = y + this.getLineHeight() * 0.5;
			const pointer = this.pointer.active
				? 1 -
					smoothstep(
						0,
						this.pointer.down ? 240 : 165,
						Math.hypot(centerX - this.pointer.x, centerY - this.pointer.y),
					)
				: 0;
			const meshX = Math.sin(rowIndex * 0.85 + timestamp * 0.006) * 8;
			const meshY = Math.cos(charIndex * 0.24 + timestamp * 0.005) * 5;
			const spring = pointer + this.getSoftBurstInfluence(centerX, centerY, timestamp, 0.75);
			const dx = (centerX - this.pointer.x) * 0.16 * spring + meshX * spring;
			const dy = (centerY - this.pointer.y) * 0.16 * spring + meshY * spring;
			const original = row.original[charIndex];
			const char =
				spring > hashCell(charIndex, rowIndex) * 0.82
					? getMutationCharForTime(original, charIndex, rowIndex, timestamp, 110)
					: original;

			this.context.globalAlpha = 0.18 + Math.min(1, spring) * 0.82;
			this.context.fillStyle = this.palette.text;
			this.context.fillText(char, x + dx, y + dy);
			this.context.globalAlpha = 1;
		}
	}

	private getCellState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		if (this.mode === "spotlight" || this.mode === "spotlight-hidden") {
			return this.getSpotlightState(x, y, charIndex, rowIndex, timestamp);
		}

		if (this.mode === "scanline") {
			return this.getScanlineState(x, y, charIndex, rowIndex, timestamp);
		}

		if (this.mode === "interference") {
			return this.getInterferenceState(x, y, charIndex, rowIndex, timestamp);
		}

		if (this.mode === "radar-halo") {
			return this.getRadarHaloState(x, y, charIndex, rowIndex, timestamp);
		}

		if (this.mode === "god-light") {
			return this.getGodLightState(x, y, charIndex, rowIndex, timestamp);
		}

		if (this.mode === "corner-sunburst") {
			return this.getCornerSunburstState(x, y, charIndex, rowIndex, timestamp);
		}

		return this.getElasticState(x, y, charIndex, rowIndex, timestamp);
	}

	private getSpotlightState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		const pointerReveal = this.spotlightRadius
			? 1 -
				smoothstep(
					0,
					150 * this.spotlightRadius,
					Math.hypot(x - this.pointer.x, y - this.pointer.y),
				)
			: 0;
		const burstReveal = this.getScrambleWaveInfluence(x, y, charIndex, rowIndex, timestamp);
		const reveal = Math.max(pointerReveal, burstReveal);
		const hash = hashCell(charIndex, rowIndex);
		const original = this.rows[rowIndex].original[charIndex];

		if (reveal > hash * 0.75) {
			return {
				char: original,
				color: this.palette.text,
				alpha: 0.55 + reveal * 0.45,
			};
		}

		if (this.mode === "spotlight-hidden") {
			return {
				char: original,
				color: this.palette.background,
				alpha: 1,
			};
		}

		return {
			char: getStableMutationChar(original, charIndex, rowIndex),
			color: this.palette.text,
			alpha: 0.18,
		};
	}

	private getElasticState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		const row = this.rows[rowIndex];
		const tension = Math.min(1, Math.abs(row.velocity) / 14 + Math.abs(row.offset) / 90);
		const pointerBand = this.pointer.active
			? 1 - smoothstep(0, 120, Math.hypot(x - this.pointer.x, y - this.pointer.y))
			: 0;
		const original = row.original[charIndex];
		const active = Math.max(tension, pointerBand * 0.6);

		if (active > hashCell(charIndex, rowIndex) * 0.9) {
			return {
				char: getMutationCharForTime(original, charIndex, rowIndex, timestamp, 130),
				color: this.palette.text,
				alpha: 0.55 + active * 0.45,
			};
		}

		return {
			char: original,
			color: this.palette.text,
			alpha: 0.18 + tension * 0.3,
		};
	}

	private getScanlineState(
		_x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		_timestamp: number,
	) {
		const hold = this.scanlineHold;
		const scanY = this.scanlineY;
		const direction = this.scanlineDirection;
		const distance = Math.abs(y - scanY);
		const beamWidth = 70 + hold * 95;
		const afterglowWidth = 165 + hold * 130;
		const beam = 1 - smoothstep(0, beamWidth, distance);
		const afterglowDistance = hold > 0 ? distance : direction > 0 ? scanY - y : y - scanY;
		const afterglow =
			afterglowDistance > 0 ? 1 - smoothstep(0, afterglowWidth, afterglowDistance) : 0;
		const original = this.rows[rowIndex].original[charIndex];
		const active = Math.max(beam, afterglow * 0.22);

		if (beam > hashCell(charIndex, rowIndex) * 0.88) {
			return {
				char: original,
				color: this.palette.text,
				alpha: 0.55 + beam * 0.45,
			};
		}

		return {
			char: active > 0.16 ? getStableMutationChar(original, charIndex, rowIndex) : original,
			color: this.palette.text,
			alpha: 0.16 + active * 0.34,
		};
	}

	private getInterferenceState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		const sourceAX = this.width * 0.28 + Math.sin(timestamp * 0.00031) * this.width * 0.12;
		const sourceAY = this.height * 0.42 + Math.cos(timestamp * 0.00027) * this.height * 0.18;
		const sourceBX = this.width * 0.72 + Math.cos(timestamp * 0.00029) * this.width * 0.14;
		const sourceBY = this.height * 0.58 + Math.sin(timestamp * 0.00033) * this.height * 0.16;
		const waveA = Math.sin(Math.hypot(x - sourceAX, y - sourceAY) * 0.07 - timestamp * 0.006);
		const waveB = Math.sin(Math.hypot(x - sourceBX, y - sourceBY) * 0.07 - timestamp * 0.0064);
		const clickWave = this.getSoftBurstInfluence(x, y, timestamp, 0.75);
		const interference = Math.abs(waveA + waveB) * 0.5;
		const active = Math.max(smoothstep(0.58, 0.98, interference), clickWave);
		const original = this.rows[rowIndex].original[charIndex];

		if (active > hashCell(charIndex, rowIndex) * 0.86) {
			return {
				char: getMutationCharForTime(original, charIndex, rowIndex, timestamp, 105),
				color: this.palette.text,
				alpha: 0.55 + active * 0.45,
			};
		}

		return {
			char: original,
			color: this.palette.text,
			alpha: 0.16 + interference * 0.24,
		};
	}

	private getRadarHaloState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		_timestamp: number,
	) {
		const centerX = this.width * 0.5;
		const centerY = this.height * 0.5;
		const dx = x - centerX;
		const dy = y - centerY;
		const distance = Math.hypot(dx, dy);
		const angle = Math.atan2(dy, dx);
		const sweep = this.radarHaloAngle;
		const angleDistance = Math.abs(Math.atan2(Math.sin(angle - sweep), Math.cos(angle - sweep)));
		const coneLength = Math.hypot(this.width, this.height) * 0.62;
		const distanceFade =
			(1 - smoothstep(coneLength * 0.82, coneLength, distance)) * smoothstep(0, 32, distance);
		const beamWidth = 0.16 + this.radarHaloHold * 0.08;
		const beam = 1 - smoothstep(0, beamWidth, angleDistance);
		const trailWidth = beamWidth * (2.2 + this.radarHaloHold * 0.8);
		const trail = 1 - smoothstep(beamWidth * 0.8, trailWidth, angleDistance);
		const beamActive = beam * distanceFade;
		const trailActive = trail * distanceFade * 0.18;
		const original = this.rows[rowIndex].original[charIndex];

		if (beamActive > hashCell(charIndex, rowIndex) * 0.84) {
			return {
				char: original,
				color: this.palette.text,
				alpha: 0.55 + beamActive * 0.45,
			};
		}

		if (trailActive > hashCell(charIndex, rowIndex) * 0.76) {
			return {
				char: getMutationCharForTime(
					original,
					charIndex,
					rowIndex,
					this.radarHaloLastTimestamp,
					92,
				),
				color: this.palette.text,
				alpha: 0.48 + trailActive * 0.4,
			};
		}

		return {
			char: getStableMutationChar(original, charIndex, rowIndex),
			color: this.palette.text,
			alpha: 0.14,
		};
	}

	private getGodLightState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		const sourceX = -this.width * 0.08;
		const sourceY = -this.height * 0.1;
		const targetX = this.pointer.active ? this.pointer.x : this.width * 0.62;
		const targetY = this.pointer.active ? this.pointer.y : this.height * 0.38;
		const angle = Math.atan2(y - sourceY, x - sourceX);
		const targetAngle = Math.atan2(targetY - sourceY, targetX - sourceX);
		const distance = Math.hypot(x - sourceX, y - sourceY);
		const angleDistance = Math.abs(
			Math.atan2(Math.sin(angle - targetAngle), Math.cos(angle - targetAngle)),
		);
		const drift = timestamp * 0.00022;
		const beamA = Math.sin(
			angleDistance * 34 + drift + Math.sin(distance * 0.006 - timestamp * 0.0012) * 0.8,
		);
		const beamB = Math.sin(angleDistance * 58 - drift * 1.7 + hash1D(rowIndex * 4.7) * 2.4);
		const rays =
			(1 - smoothstep(0, 0.62, angleDistance)) *
			smoothstep(0.18, 0.95, beamA * 0.68 + beamB * 0.32);
		const falloff = 1 - smoothstep(120, Math.hypot(this.width, this.height) * 1.05, distance);
		const reveal = rays * falloff;
		const original = this.rows[rowIndex].original[charIndex];

		if (reveal > hashCell(charIndex, rowIndex) * 0.82) {
			return {
				char: original,
				color: this.palette.text,
				alpha: 0.5 + reveal * 0.5,
			};
		}

		return {
			char: getStableMutationChar(original, charIndex, rowIndex),
			color: this.palette.text,
			alpha: 0.14 + reveal * 0.2,
		};
	}

	private getCornerSunburstState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		const sourceX = -this.width * 0.08;
		const sourceY = -this.height * 0.1;
		const dx = x - sourceX;
		const dy = y - sourceY;
		const angle = Math.atan2(dy, dx);
		const distance = Math.hypot(dx, dy);
		const rotation = timestamp * 0.00042;
		const rays = Math.sin(
			angle * 22 + rotation + Math.sin(distance * 0.004 - timestamp * 0.001) * 0.9,
		);
		const secondary = Math.sin(angle * 37 - rotation * 1.8 + hash1D(rowIndex * 8.3) * 2.6);
		const rayMask = smoothstep(0.28, 0.96, rays * 0.68 + secondary * 0.32);
		const falloff = 1 - smoothstep(80, Math.hypot(this.width, this.height) * 1.05, distance);
		const reveal = rayMask * falloff;
		const original = this.rows[rowIndex].original[charIndex];

		if (reveal > hashCell(charIndex, rowIndex) * 0.84) {
			return {
				char: original,
				color: this.palette.text,
				alpha: 0.5 + reveal * 0.5,
			};
		}

		return {
			char: getStableMutationChar(original, charIndex, rowIndex),
			color: this.palette.text,
			alpha: 0.14 + reveal * 0.2,
		};
	}

	private getScrambleWaveInfluence(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		let strongest = 0;
		const maxRadius = Math.hypot(this.width, this.height) * 0.92;
		const timeNoise = hash1D(
			charIndex * 11.31 + rowIndex * 41.17 + Math.floor(timestamp / 120) * 5.91,
		);

		for (const burst of this.bursts) {
			const age = timestamp - burst.startedAt;

			if (age < 0 || age > BURST_DURATION) {
				continue;
			}

			const progress = age / BURST_DURATION;
			const localProgress = Math.min(1, age / BURST_LOCAL_DURATION);
			const radius = smoothstep01(progress) * maxRadius;
			const distance = Math.hypot(x - burst.x, y - burst.y);
			const ringDistance = Math.abs(distance - radius) / maxRadius;
			const ring = (1 - smoothstep01(ringDistance / (BURST_RING_WIDTH * 0.62))) * 0.62;
			const life = smoothstep(0, 0.18, progress) * (1 - smoothstep(0.62, 1, progress));
			const localRadius = BURST_LOCAL_RADIUS * 0.72 * (1 + localProgress * 0.34);
			const localFalloff = 1 - smoothstep(0, localRadius, distance);
			const localChaos =
				localFalloff * (1 - smoothstep01(localProgress)) * (0.46 + timeNoise * 0.14);

			strongest = Math.max(strongest, localChaos, ring * life);
		}

		const activation = strongest * BURST_ACTIVATION_STRENGTH * (0.78 + timeNoise * 0.48);

		return Math.min(1, Math.max(strongest, activation));
	}

	private getScrambleCellState(
		x: number,
		y: number,
		charIndex: number,
		rowIndex: number,
		timestamp: number,
	) {
		const strength = this.getScrambleWaveInfluence(x, y, charIndex, rowIndex, timestamp);

		return {
			active: strength > 0.18 + hashCell(charIndex, rowIndex) * 0.92,
			strength,
		};
	}

	private getSoftBurstInfluence(x: number, y: number, timestamp: number, strength: number) {
		let strongest = 0;

		for (const burst of this.bursts) {
			const age = timestamp - burst.startedAt;

			if (age < 0 || age > 1300) {
				continue;
			}

			const progress = age / 1300;
			const radius = smoothstep01(progress) * Math.hypot(this.width, this.height) * 0.75;
			const distance = Math.hypot(x - burst.x, y - burst.y);
			const edge = 1 - smoothstep(0, 95, Math.abs(distance - radius));
			const local = (1 - smoothstep(0, 130, distance)) * (1 - smoothstep01(progress));

			strongest = Math.max(strongest, Math.max(edge * strength, local));
		}

		return strongest;
	}

	private updateScanline(timestamp: number) {
		if (this.mode !== "scanline") {
			return;
		}

		if (this.scanlineLastTimestamp === 0) {
			this.scanlineLastTimestamp = timestamp;
		}

		const delta = Math.min(50, timestamp - this.scanlineLastTimestamp);
		this.scanlineLastTimestamp = timestamp;

		const holdTarget = this.pointer.down && this.pointer.active ? 1 : 0;
		this.scanlineHold += (holdTarget - this.scanlineHold) * 0.16;

		if (this.pointer.down && this.pointer.active) {
			const nextY = this.scanlineY + (this.pointer.y - this.scanlineY) * 0.32;
			const movement = nextY - this.scanlineY;
			if (Math.abs(movement) > 0.1) {
				this.scanlineDirection = movement > 0 ? 1 : -1;
			}
			this.scanlineVelocity = movement / Math.max(1, delta);
			this.scanlineY = nextY;
			return;
		}

		const baseVelocity = this.scanlineDirection * 0.24;
		this.scanlineY += delta * (baseVelocity + this.scanlineVelocity);
		this.scanlineVelocity *= 0.9 ** (delta / 16);

		if (this.scanlineY > this.height + 90) {
			this.scanlineY = this.height + 90;
			this.scanlineDirection = -1;
			this.scanlineVelocity *= -0.45;
		} else if (this.scanlineY < -90) {
			this.scanlineY = -90;
			this.scanlineDirection = 1;
			this.scanlineVelocity *= -0.45;
		}
	}

	private updateRadarHalo(timestamp: number) {
		if (this.mode !== "radar-halo") {
			return;
		}

		const delta =
			this.radarHaloLastTimestamp > 0 ? Math.min(50, timestamp - this.radarHaloLastTimestamp) : 16;
		this.radarHaloLastTimestamp = timestamp;
		const holdTarget = this.pointer.down ? 1 : 0;
		this.radarHaloHold += (holdTarget - this.radarHaloHold) * 0.16;

		if (this.pointer.down && this.pointer.active) {
			const targetAngle = Math.atan2(
				this.pointer.y - this.height * 0.5,
				this.pointer.x - this.width * 0.5,
			);
			const angleDelta = Math.atan2(
				Math.sin(targetAngle - this.radarHaloAngle),
				Math.cos(targetAngle - this.radarHaloAngle),
			);
			const angleStep = angleDelta * 0.18;
			this.radarHaloAngle += angleStep;
			this.radarHaloAngularVelocity = angleStep / Math.max(1, delta);
			return;
		}

		const baseSpeed = 0.0011 * (1 - this.radarHaloHold * 0.72);
		this.radarHaloAngle =
			(this.radarHaloAngle + delta * (baseSpeed + this.radarHaloAngularVelocity)) % (Math.PI * 2);
		this.radarHaloAngularVelocity *= 0.9 ** (delta / 16);
	}

	private updateElasticRows() {
		if (this.mode !== "elastic") {
			return;
		}

		for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex += 1) {
			const row = this.rows[rowIndex];
			const rowY = rowIndex * this.getLineHeight() + this.getLineHeight() * 0.5;
			const direction = this.pointer.x < this.width * 0.5 ? 1 : -1;
			const pull = this.pointer.active
				? (1 - smoothstep(0, this.pointer.down ? 210 : 150, Math.abs(rowY - this.pointer.y))) *
					direction *
					(this.pointer.down ? 86 : 34)
				: 0;

			row.velocity += (pull - row.offset) * 0.085;
			row.velocity *= 0.82;
			row.offset += row.velocity;
		}
	}

	private updateSpotlightRadius(timestamp: number) {
		const delta = this.spotlightRadiusLastTimestamp
			? Math.min(50, timestamp - this.spotlightRadiusLastTimestamp)
			: 16;
		this.spotlightRadiusLastTimestamp = timestamp;
		const target = this.pointer.active ? 1 : 0;
		this.spotlightRadius += (target - this.spotlightRadius) * (1 - Math.exp(-delta / 180));
		if (this.spotlightRadius < 0.001) this.spotlightRadius = 0;
	}

	private updateMutations(timestamp: number) {
		if (this.mode !== "scramble") {
			return;
		}

		for (const row of this.rows) {
			for (const [index, expiresAt] of row.mutations) {
				if (expiresAt <= timestamp) {
					row.chars[index] = row.original[index];
					row.mutations.delete(index);
				}
			}
		}

		const mutationCount = Math.max(2, Math.floor(this.rows.length * 0.24));

		for (let i = 0; i < mutationCount; i += 1) {
			const row = this.rows[Math.floor(Math.random() * this.rows.length)];
			const index = Math.floor(Math.random() * row.chars.length);
			const originalChar = row.original[index];

			row.chars[index] = getRandomMutationChar(originalChar);
			row.mutations.set(
				index,
				timestamp + randomBetween(MUTATION_MIN_DURATION, MUTATION_MAX_DURATION),
			);
		}
	}

	private updateBursts(timestamp: number) {
		this.bursts = this.bursts.filter((burst) => timestamp - burst.startedAt <= BURST_DURATION);
	}

	private buildFullWidthLine(rowIndex: number) {
		const x = -getRowOffset(rowIndex);
		let line = "";
		let phraseIndex = rowIndex % TEXT_PHRASES.length;

		while (this.context.measureText(line).width < this.width - x + this.getTextSize() * 4) {
			line += `${TEXT_PHRASES[phraseIndex % TEXT_PHRASES.length]} . `;
			phraseIndex += rowIndex + 3;
		}

		return { line, x };
	}
}

export class AsciiEffectRenderer {
	private readonly gl: WebGLRenderingContext;
	private readonly context: CanvasRenderingContext2D;
	private readonly offscreenCanvas = document.createElement("canvas");
	private readonly scene: CanvasTextureScene;
	private readonly texture: WebGLTexture;
	private readonly theme: AnimationTheme;
	private width = 1;
	private height = 1;
	private dpr = 1;
	private visible = true;
	private lastFrameTime = 0;
	private readonly abortController = new AbortController();
	private readonly pointer: PointerState = {
		active: false,
		down: false,
		x: -9999,
		y: -9999,
	};

	constructor(
		private readonly canvas: HTMLCanvasElement,
		private readonly mode: Extract<EffectMode, "ascii-topographic" | "ascii-fluid">,
	) {
		this.gl = requireWebGLContext(canvas);
		this.context = require2DContext(this.offscreenCanvas);
		this.scene = createCanvasTextureScene(this.gl);
		this.texture = this.scene.texture;
		this.theme = new AnimationTheme(canvas);
		this.bindEvents();
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

		this.width = width;
		this.height = height;
		this.dpr = dpr;
		this.offscreenCanvas.width = this.canvas.width;
		this.offscreenCanvas.height = this.canvas.height;
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	}

	render(timestamp: number) {
		if (!this.visible || timestamp - this.lastFrameTime < 1000 / 30) return;
		this.lastFrameTime = timestamp;
		this.draw(timestamp);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	dispose() {
		this.abortController.abort();
		this.scene.dispose();
		this.theme.dispose();
	}

	private bindEvents() {
		const { signal } = this.abortController;

		this.canvas.addEventListener(
			"pointermove",
			(event) => updatePointerFromEvent(this.canvas, this.pointer, event, true),
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerenter",
			(event) => updatePointerFromEvent(this.canvas, this.pointer, event, true),
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerleave",
			() => {
				this.pointer.active = false;
			},
			{ signal },
		);
	}

	private draw(timestamp: number) {
		this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.context.fillStyle = this.theme.palette.background;
		this.context.fillRect(0, 0, this.width, this.height);
		this.context.font = `${TEXT_SIZE}px "Geist Mono", monospace`;
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";

		if (this.mode === "ascii-topographic") {
			this.drawTopographic(timestamp);
		} else {
			this.drawFluid(timestamp);
		}

		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.texImage2D(
			this.gl.TEXTURE_2D,
			0,
			this.gl.RGBA,
			this.gl.RGBA,
			this.gl.UNSIGNED_BYTE,
			this.offscreenCanvas,
		);
		const clear = parseRgbColor(this.theme.palette.background);
		this.gl.clearColor(clear.r / 255, clear.g / 255, clear.b / 255, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
	}

	private drawTopographic(timestamp: number) {
		const time = timestamp * 0.001;
		const cell = 10;
		const chars = " .:-=+*#%@";

		for (let y = cell; y < this.height; y += cell) {
			for (let x = cell; x < this.width; x += cell) {
				const nx = x / this.width - 0.5;
				const ny = y / this.height - 0.5;
				const d1 = Math.hypot(nx + 0.18 + Math.sin(time * 0.31) * 0.08, ny - 0.06);
				const d2 = Math.hypot(nx - 0.22, ny + 0.12 + Math.cos(time * 0.27) * 0.08);
				const terrain =
					Math.sin(d1 * 42 - time * 1.4) +
					Math.sin(d2 * 36 + time * 1.1) +
					Math.sin((nx - ny) * 24);
				const contour =
					1 - smoothstep(0, 0.14, Math.abs(fract(terrain * 0.18 + time * 0.08) - 0.5));
				const hover = this.pointer.active
					? 1 - smoothstep(0, 180, Math.hypot(x - this.pointer.x, y - this.pointer.y))
					: 0;
				const value = Math.max(contour * 0.82, hover * 0.75);
				const char = chars[Math.floor(value * (chars.length - 1))] ?? " ";

				if (char === " ") continue;
				this.context.fillStyle = this.theme.palette.text;
				this.context.fillText(char, x, y + Math.sin(time * 2 + x * 0.03) * 1.5);
			}
		}
	}

	private drawFluid(timestamp: number) {
		const time = timestamp * 0.001;
		const cell = 10;
		const chars = " .,:;irsXA253hMHGS#9B&@";
		const sourceX = this.pointer.active
			? this.pointer.x
			: this.width * 0.5 + Math.sin(time * 0.6) * this.width * 0.2;
		const sourceY = this.pointer.active
			? this.pointer.y
			: this.height * 0.5 + Math.cos(time * 0.5) * this.height * 0.18;

		for (let y = cell; y < this.height; y += cell) {
			for (let x = cell; x < this.width; x += cell) {
				const nx = (x - this.width * 0.5) / this.width;
				const ny = (y - this.height * 0.5) / this.height;
				const angle = Math.atan2(y - sourceY, x - sourceX);
				const distance = Math.hypot(x - sourceX, y - sourceY);
				const curl =
					Math.sin(nx * 28 + Math.sin(ny * 18 + time) * 2.4 + time * 1.5) +
					Math.cos(ny * 31 + Math.sin(nx * 16 - time) * 2.2 - time * 1.2) +
					Math.sin(angle * 5 + distance * 0.035 - time * 3.2);
				const smoke = (curl + 3) / 6;
				const plume = 1 - smoothstep(0, Math.max(this.width, this.height) * 0.58, distance);
				const value = Math.max(0, Math.min(1, smoke * plume + plume * 0.35));
				const char = chars[Math.floor(value * (chars.length - 1))] ?? " ";

				if (char === " ") continue;
				this.context.fillStyle = this.theme.palette.text;
				this.context.fillText(
					char,
					x + Math.cos(angle + time) * value * 8,
					y + Math.sin(angle - time) * value * 8,
				);
			}
		}
	}
}

export class DitherSmokeRenderer {
	private readonly context: CanvasRenderingContext2D;
	private readonly theme: AnimationTheme;
	private width = 1;
	private height = 1;
	private dpr = 1;
	private visible = true;
	private lastFrameTime = 0;
	private readonly abortController = new AbortController();
	private readonly pointer: PointerState = {
		active: false,
		down: false,
		x: -9999,
		y: -9999,
	};

	constructor(private readonly canvas: HTMLCanvasElement) {
		this.context = require2DContext(canvas);
		this.theme = new AnimationTheme(canvas);
		this.bindEvents();
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

		this.width = width;
		this.height = height;
		this.dpr = dpr;
		this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	render(timestamp: number) {
		if (!this.visible || timestamp - this.lastFrameTime < 1000 / 30) return;
		this.lastFrameTime = timestamp;
		this.draw(timestamp);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	dispose() {
		this.abortController.abort();
		this.theme.dispose();
	}

	private bindEvents() {
		const { signal } = this.abortController;

		this.canvas.addEventListener(
			"pointermove",
			(event) => updatePointerFromEvent(this.canvas, this.pointer, event, true),
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerenter",
			(event) => updatePointerFromEvent(this.canvas, this.pointer, event, true),
			{ signal },
		);
		this.canvas.addEventListener(
			"pointerleave",
			() => {
				this.pointer.active = false;
			},
			{ signal },
		);
	}

	private draw(timestamp: number) {
		const time = timestamp * 0.001;
		const cell = Math.max(3.8, Math.min(5.8, this.width * 0.006));
		const sourceX = this.pointer.active
			? this.pointer.x
			: this.width * 0.5 + Math.sin(time * 0.42) * this.width * 0.18;
		const sourceY = this.pointer.active
			? this.pointer.y
			: this.height * 0.58 + Math.cos(time * 0.35) * this.height * 0.12;
		const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

		this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		this.context.fillStyle = this.theme.palette.background;
		this.context.fillRect(0, 0, this.width, this.height);

		for (let y = 0; y < this.height; y += cell) {
			for (let x = 0; x < this.width; x += cell) {
				const dx = x - sourceX;
				const dy = y - sourceY;
				const distance = Math.hypot(dx, dy);
				const angle = Math.atan2(dy, dx);
				const nx = x / this.width - 0.5;
				const ny = y / this.height - 0.5;
				const plumeA = 1 - smoothstep(0, Math.max(this.width, this.height) * 0.66, distance);
				const plumeB =
					1 -
					smoothstep(
						0,
						this.height * 0.44,
						Math.hypot(dx + Math.sin(y * 0.018 + time) * 90, dy - this.height * 0.22),
					);
				const curl =
					Math.sin(nx * 28 + Math.sin(ny * 21 + time * 1.4) * 2.6 + time * 1.6) +
					Math.cos(ny * 32 + Math.sin(nx * 18 - time) * 2.2 - time * 1.2) +
					Math.sin(angle * 5 + distance * 0.035 - time * 3.4);
				const verticalStreak =
					Math.sin(x * 0.028 + Math.sin(y * 0.012 + time) * 2.1 + time * 0.8) * 0.18;
				const rise = 1 - smoothstep(-this.height * 0.34, this.height * 0.46, y - sourceY);
				const value = Math.max(
					0,
					Math.min(
						1,
						Math.max(plumeA, plumeB * 0.82) * (0.38 + curl * 0.15 + rise * 0.28 + verticalStreak),
					),
				);
				const matrixIndex = (Math.floor(x / cell) % 4) + (Math.floor(y / cell) % 4) * 4;
				const threshold = ((bayer[matrixIndex] ?? 0) + 0.5) / 16;
				const sparseNoise = hash1D(
					Math.floor(x / cell) * 19.7 + Math.floor(y / cell) * 53.1 + Math.floor(time * 6) * 4.3,
				);

				if (value + sparseNoise * 0.08 <= threshold) {
					continue;
				}

				const dot = cell * (0.42 + value * 0.34);
				const channelShift = cell * 0.34;
				const cyan = Math.max(0, Math.min(1, value * 1.08));
				const blue = Math.max(0, Math.min(1, value * 0.9 + curl * 0.08));

				this.context.fillStyle = this.theme.palette.text;
				this.context.globalAlpha = 0.35 + cyan * 0.55;
				this.context.fillRect(x, y, dot, dot);

				if (value > threshold + 0.12) {
					this.context.fillStyle = this.theme.palette.text;
					this.context.globalAlpha = 0.25 + blue * 0.5;
					this.context.fillRect(x + channelShift, y + channelShift, dot * 0.92, dot * 0.92);
				}
				this.context.globalAlpha = 1;
			}
		}
	}
}

export type AnimationRoute = {
	path: `/lab/${string}`;
	label: string;
	mode: string;
	createRenderer(canvas: HTMLCanvasElement): AnimationRenderer;
};

export function AnimationCanvas({
	route,
	className,
}: {
	route: AnimationRoute;
	className?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		const renderer = route.createRenderer(canvas);

		return startAnimationLoop(renderer, canvas);
	}, [route]);

	return <canvas key={route.mode} ref={canvasRef} className={className ?? "block size-full"} />;
}

function getRowOffset(rowIndex: number) {
	return ((rowIndex * 37) % 181) + (rowIndex % 4) * 6.5;
}

function getRandomMutationChar(originalChar: string) {
	const randomIndex = Math.floor(Math.random() * MUTATION_CHARS.length);
	const nextChar = MUTATION_CHARS[randomIndex];

	if (nextChar !== originalChar) {
		return nextChar;
	}

	return MUTATION_CHARS[(randomIndex + 1) % MUTATION_CHARS.length];
}

function getMutationCharForTime(
	originalChar: string,
	charIndex: number,
	rowIndex: number,
	timestamp: number,
	frameDuration: number,
) {
	const scrambleFrame = Math.floor(timestamp / frameDuration);
	const seed = hash1D(charIndex * 17.13 + rowIndex * 31.71 + scrambleFrame * 19.37);
	const index = Math.floor(seed * MUTATION_CHARS.length) % MUTATION_CHARS.length;
	const nextChar = MUTATION_CHARS[index];

	if (nextChar !== originalChar) {
		return nextChar;
	}

	return MUTATION_CHARS[(index + 1) % MUTATION_CHARS.length];
}

function getStableMutationChar(originalChar: string, charIndex: number, rowIndex: number) {
	const seed = hash1D(charIndex * 23.31 + rowIndex * 71.17);
	const index = Math.floor(seed * MUTATION_CHARS.length) % MUTATION_CHARS.length;
	const nextChar = MUTATION_CHARS[index];

	if (nextChar !== originalChar) {
		return nextChar;
	}

	return MUTATION_CHARS[(index + 1) % MUTATION_CHARS.length];
}

function hashCell(charIndex: number, rowIndex: number) {
	return hash1D(charIndex * 127.1 + rowIndex * 311.7);
}

function hash1D(value: number) {
	return fract(Math.sin(value * 12.9898) * 43758.5453);
}

function fract(value: number) {
	return value - Math.floor(value);
}

function smoothstep(edge0: number, edge1: number, value: number) {
	const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));

	return t * t * (3 - 2 * t);
}

function smoothstep01(value: number) {
	return smoothstep(0, 1, value);
}

function randomBetween(min: number, max: number) {
	return min + Math.random() * (max - min);
}

function updatePointerFromEvent(
	canvas: HTMLCanvasElement,
	pointer: PointerState,
	event: PointerEvent,
	active: boolean,
) {
	const rect = canvas.getBoundingClientRect();

	pointer.active = active;
	pointer.x = event.clientX - rect.left;
	pointer.y = event.clientY - rect.top;
}

type CanvasTextureScene = {
	texture: WebGLTexture;
	dispose(): void;
};

function createCanvasTextureScene(gl: WebGLRenderingContext): CanvasTextureScene {
	const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
	const positionLocation = gl.getAttribLocation(program, "a_position");
	const uvLocation = gl.getAttribLocation(program, "a_uv");
	const textureLocation = gl.getUniformLocation(program, "u_texture");
	const vertexBuffer = gl.createBuffer();
	const texture = gl.createTexture();

	if (!vertexBuffer || !texture || !textureLocation) {
		throw new Error("Could not create WebGL resources.");
	}

	gl.useProgram(program);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
	gl.enableVertexAttribArray(uvLocation);
	gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.uniform1i(textureLocation, 0);

	return {
		texture,
		dispose: () => {
			gl.deleteTexture(texture);
			gl.deleteBuffer(vertexBuffer);
			gl.deleteProgram(program);
		},
	};
}

function requireWebGLContext(target: HTMLCanvasElement) {
	const context = target.getContext("webgl", {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
	});

	if (!context) {
		throw new Error("WebGL is not supported in this browser.");
	}

	return context;
}

function require2DContext(target: HTMLCanvasElement) {
	const context = target.getContext("2d", {
		alpha: false,
	});

	if (!context) {
		throw new Error("Could not create offscreen 2D canvas.");
	}

	return context;
}

function createProgram(
	renderingContext: WebGLRenderingContext,
	vertexSource: string,
	fragmentSource: string,
) {
	const vertexShader = createShader(renderingContext, renderingContext.VERTEX_SHADER, vertexSource);
	const fragmentShader = createShader(
		renderingContext,
		renderingContext.FRAGMENT_SHADER,
		fragmentSource,
	);
	const nextProgram = renderingContext.createProgram();

	if (!nextProgram) {
		throw new Error("Could not create WebGL program.");
	}

	renderingContext.attachShader(nextProgram, vertexShader);
	renderingContext.attachShader(nextProgram, fragmentShader);
	renderingContext.linkProgram(nextProgram);

	if (!renderingContext.getProgramParameter(nextProgram, renderingContext.LINK_STATUS)) {
		const info = renderingContext.getProgramInfoLog(nextProgram);
		renderingContext.deleteProgram(nextProgram);
		throw new Error(`Could not link WebGL program: ${info}`);
	}

	return nextProgram;
}

function createShader(renderingContext: WebGLRenderingContext, type: number, source: string) {
	const shader = renderingContext.createShader(type);

	if (!shader) {
		throw new Error("Could not create WebGL shader.");
	}

	renderingContext.shaderSource(shader, source);
	renderingContext.compileShader(shader);

	if (!renderingContext.getShaderParameter(shader, renderingContext.COMPILE_STATUS)) {
		const info = renderingContext.getShaderInfoLog(shader);
		renderingContext.deleteShader(shader);
		throw new Error(`Could not compile WebGL shader: ${info}`);
	}

	return shader;
}
