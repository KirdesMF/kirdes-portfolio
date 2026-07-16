import { type AnimationRoute, AsciiEffectRenderer } from "../webgl-text";

export const AsciiTopographicAnimation = {
	path: "/lab/ascii-topographic",
	label: "ASCII Topographic Waves",
	mode: "ascii-topographic",
	createRenderer: (canvas) => new AsciiEffectRenderer(canvas, "ascii-topographic"),
} satisfies AnimationRoute;
