import { DitherSphereRenderer } from "../renderers/dither-sphere";
import type { AnimationRoute } from "../webgl-text";

export const DitherEyeAnimation = {
	path: "/lab/dither-eye",
	label: "Dither Eye",
	mode: "dither-eye",
	createRenderer: (canvas) => new DitherSphereRenderer(canvas),
} satisfies AnimationRoute;
