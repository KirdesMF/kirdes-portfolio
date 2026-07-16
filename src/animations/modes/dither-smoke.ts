import { type AnimationRoute, DitherSmokeRenderer } from "../webgl-text";

export const DitherSmokeAnimation = {
	path: "/lab/dither-smoke",
	label: "Dither Smoke",
	mode: "dither-smoke",
	createRenderer: (canvas) => new DitherSmokeRenderer(canvas),
} satisfies AnimationRoute;
