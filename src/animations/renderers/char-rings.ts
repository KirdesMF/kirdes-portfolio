import type { AnimationRenderer } from "../animation-loop";
import { AnimationTheme } from "../theme";

const TEXT = "CEDRIC GOURVILLE PORTFOLIO 2026 · SOFTWARE ENGINEER · WEBGL TYPOGRAPHY SYSTEMS · ";
const MUTATION_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TEXT_SIZE = 10;
const LINE_HEIGHT = 13;
const RING_SPACING = 74;

export class CharRingsRenderer implements AnimationRenderer {
	private readonly context: CanvasRenderingContext2D;
	private readonly abortController = new AbortController();
	private readonly theme: AnimationTheme;
	private width = 1;
	private height = 1;
	private dpr = 1;
	private visible = true;
	private pointerDown = false;
	private hold = 0;
	private releaseHold = 0;
	private releasedAt = -1;
	private rotation = 0;
	private lastTimestamp = 0;

	constructor(private readonly canvas: HTMLCanvasElement) {
		const context = canvas.getContext("2d", { alpha: false });
		if (!context) throw new Error("Could not create 2D canvas context.");
		this.context = context;
		this.theme = new AnimationTheme(canvas);

		const { signal } = this.abortController;
		canvas.addEventListener(
			"pointerdown",
			(event) => {
				this.pointerDown = true;
				canvas.setPointerCapture(event.pointerId);
			},
			{ signal },
		);
		canvas.addEventListener("pointerup", (event) => this.release(event), { signal });
		canvas.addEventListener("pointercancel", (event) => this.release(event), { signal });
		window.addEventListener("blur", () => this.release(), { signal });
	}

	resize() {
		const rect = this.canvas.getBoundingClientRect();
		this.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
		const width = Math.max(1, Math.round(rect.width * this.dpr));
		const height = Math.max(1, Math.round(rect.height * this.dpr));
		if (this.canvas.width !== width || this.canvas.height !== height) {
			this.canvas.width = width;
			this.canvas.height = height;
		}
		this.width = rect.width;
		this.height = rect.height;
	}

	render(timestamp: number) {
		if (!this.visible || timestamp - this.lastTimestamp < 1000 / 30) return;
		const delta = this.lastTimestamp ? Math.min(50, timestamp - this.lastTimestamp) : 16;
		this.lastTimestamp = timestamp;
		this.hold += ((this.pointerDown ? 1 : 0) - this.hold) * (1 - Math.exp(-delta / 95));
		this.rotation += delta * 0.00012 * (1 - this.hold * 0.96);
		this.draw(timestamp);
	}

	setVisible(visible: boolean) {
		this.visible = visible;
		if (!visible) this.release();
	}

	dispose() {
		this.abortController.abort();
		this.theme.dispose();
	}

	private release(event?: PointerEvent) {
		if (!this.pointerDown) return;
		this.pointerDown = false;
		this.releasedAt = performance.now();
		this.releaseHold = this.hold;
		if (event && this.canvas.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}
	}

	private draw(timestamp: number) {
		const context = this.context;
		const centerX = this.width * 0.5;
		const centerY = this.height * 0.5;
		const glyphWidth = TEXT_SIZE * 0.62;
		const maxRadius = Math.hypot(this.width, this.height) * 0.62;
		const ringCount = Math.ceil(maxRadius / RING_SPACING) + 2;

		context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		context.fillStyle = this.theme.palette.background;
		context.fillRect(0, 0, this.width, this.height);
		context.font = `${TEXT_SIZE}px "Geist Mono", monospace`;
		context.textBaseline = "top";

		for (let row = 0, y = 0; y < this.height + LINE_HEIGHT; row += 1, y += LINE_HEIGHT) {
			const offset = -(((row * 37) % 181) + (row % 4) * 6.5);
			const count = Math.ceil((this.width - offset) / glyphWidth) + 1;
			for (let column = 0; column < count; column += 1) {
				const x = offset + column * glyphWidth;
				const dx = x + glyphWidth * 0.5 - centerX;
				const dy = y + LINE_HEIGHT * 0.5 - centerY;
				const distance = Math.hypot(dx, dy);
				let ringIndex = 0;
				let ringDistance = Infinity;
				for (let ring = 0; ring <= ringCount; ring += 1) {
					const candidateDistance = Math.abs(
						distance - ring * RING_SPACING * this.getRingScale(ring, timestamp),
					);
					if (candidateDistance < ringDistance) {
						ringIndex = ring;
						ringDistance = candidateDistance;
					}
				}
				const band = 1 - smoothstep(0, 24, ringDistance);
				const direction = ringIndex % 2 === 0 ? 1 : -1;
				const spokes =
					0.45 +
					Math.sin((Math.atan2(dy, dx) + direction * this.rotation) * 18 + ringIndex * 1.7) * 0.55;
				const active =
					band *
					smoothstep(0.08, 0.72, spokes) *
					(1 - smoothstep(maxRadius * 0.72, maxRadius, distance));
				const original = TEXT[(column + row * 11) % TEXT.length] ?? " ";
				const mutate = this.pointerDown && active > hash(column, row) * 0.82;
				const character = mutate
					? MUTATION_CHARS[
							Math.floor(
								hash(column + Math.floor(timestamp / 118), row + ringIndex) * MUTATION_CHARS.length,
							)
						]
					: original;
				context.globalAlpha = 0.16 + active * 0.84;
				context.fillStyle = this.theme.palette.text;
				context.fillText(character ?? original, x, y);
			}
		}
		context.globalAlpha = 1;
	}

	private getRingScale(ringIndex: number, timestamp: number) {
		const compression = 0.32;
		if (this.pointerDown) return 1 - this.hold * compression;
		if (this.releasedAt < 0) return 1;
		const age = timestamp - this.releasedAt - ringIndex * 75;
		if (age < 0) return 1 - this.releaseHold * compression;
		if (age > 1100) return 1;
		const progress = age / 1100;
		const easeOut = 1 - (1 - progress) ** 3;
		const overshoot = Math.sin(progress * Math.PI) * (1 - progress) * 0.22;
		return 1 - this.releaseHold * compression * (1 - easeOut) + overshoot;
	}
}

function hash(x: number, y: number) {
	const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
	return value - Math.floor(value);
}

function smoothstep(edge0: number, edge1: number, value: number) {
	const amount = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
	return amount * amount * (3 - 2 * amount);
}
