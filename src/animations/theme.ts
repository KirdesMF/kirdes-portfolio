export type RgbColor = { r: number; g: number; b: number };

export type AnimationPalette = {
	background: string;
	text: string;
};

export const DEFAULT_ANIMATION_PALETTE: AnimationPalette = {
	background: "#09090b",
	text: "#71717a",
};

export class AnimationTheme {
	palette: AnimationPalette;
	private readonly observer: MutationObserver;

	constructor(private readonly target: HTMLElement) {
		this.palette = getAnimationPalette(target);
		this.observer = new MutationObserver(() => {
			this.palette = getAnimationPalette(this.target);
		});
		this.observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "data-theme"],
		});
	}

	dispose() {
		this.observer.disconnect();
	}
}

export function getAnimationPalette(target: HTMLElement): AnimationPalette {
	const style = getComputedStyle(target);

	return {
		background: getThemeValue(target, style, "--page", DEFAULT_ANIMATION_PALETTE.background),
		text: getThemeValue(target, style, "--muted-foreground", DEFAULT_ANIMATION_PALETTE.text),
	};
}

export function parseRgbColor(color: string): RgbColor {
	if (color.startsWith("#")) {
		const value = color.replace("#", "");
		return {
			r: Number.parseInt(value.slice(0, 2), 16),
			g: Number.parseInt(value.slice(2, 4), 16),
			b: Number.parseInt(value.slice(4, 6), 16),
		};
	}

	const match = color.match(/rgba?\((\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)/);
	if (match) return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };

	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	const context = canvas.getContext("2d", { willReadFrequently: true });
	if (!context) return parseRgbColor(DEFAULT_ANIMATION_PALETTE.background);
	context.fillStyle = color;
	context.fillRect(0, 0, 1, 1);
	const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
	return { r, g, b };
}

export function toUnitRgb(color: string): [number, number, number] {
	const { r, g, b } = parseRgbColor(color);
	return [r / 255, g / 255, b / 255];
}

function getThemeValue(
	target: HTMLElement,
	style: CSSStyleDeclaration,
	name: string,
	fallback: string,
) {
	const resolved = resolveCssColor(
		target,
		style.getPropertyValue(name).trim() || fallback,
		fallback,
	);
	const { r, g, b } = parseRgbColor(resolved);
	return `rgb(${r}, ${g}, ${b})`;
}

function resolveCssColor(target: HTMLElement, color: string, fallback: string) {
	if (color.startsWith("#") || color.startsWith("rgb")) return color;

	const probe = document.createElement("span");
	probe.style.color = color;
	probe.style.pointerEvents = "none";
	probe.style.position = "absolute";
	probe.style.visibility = "hidden";
	(target.parentElement ?? document.body).appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	probe.remove();
	return resolved || fallback;
}
