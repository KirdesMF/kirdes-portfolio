import { CharSphereRenderer } from "../renderers/char-sphere";
import type { AnimationRoute } from "../webgl-text";

export const CharEyeAnimation = {
	path: "/lab/char-eye",
	label: "Char Eye",
	mode: "char-eye",
	createRenderer: (canvas) => new CharSphereRenderer(canvas),
} satisfies AnimationRoute;
