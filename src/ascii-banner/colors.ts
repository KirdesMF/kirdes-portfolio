export function hexToRgb(hex: string): [number, number, number] {
	const normalized = hex.replace("#", "");
	const full = normalized.length === 3
		? normalized.split("").map((char) => char + char).join("")
		: normalized.padEnd(6, "0").slice(0, 6);

	return [
		Number.parseInt(full.slice(0, 2), 16),
		Number.parseInt(full.slice(2, 4), 16),
		Number.parseInt(full.slice(4, 6), 16),
	];
}

function colorToRgb(color: string): [number, number, number] | null {
	if (color.startsWith("#")) return hexToRgb(color);

	const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (!match) return null;

	return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function mixColor(from: string, to: string, amount: number): string {
	const t = Math.max(0, Math.min(1, amount));
	const fromRgb = colorToRgb(from);
	const toRgb = colorToRgb(to);

	if (!fromRgb || !toRgb) {
		return `color-mix(in oklch, ${to} ${Math.round(t * 100)}%, ${from})`;
	}

	const [fr, fg, fb] = fromRgb;
	const [tr, tg, tb] = toRgb;
	const r = Math.round(fr + (tr - fr) * t);
	const g = Math.round(fg + (tg - fg) * t);
	const b = Math.round(fb + (tb - fb) * t);
	return `rgb(${r}, ${g}, ${b})`;
}
