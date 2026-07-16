import { type AnimationRoute, AsciiEffectRenderer } from "../webgl-text";

export const AsciiFluidAnimation = {
	path: "/lab/ascii-fluid",
	label: "ASCII Fluid Smoke",
	mode: "ascii-fluid",
	createRenderer: (canvas) => new AsciiEffectRenderer(canvas, "ascii-fluid"),
} satisfies AnimationRoute;
