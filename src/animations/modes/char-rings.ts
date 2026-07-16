import { CharRingsRenderer } from "../renderers/char-rings";
import type { AnimationRoute } from "../webgl-text";

export const CharRingsAnimation = {
	path: "/lab/char-rings",
	label: "Char Rings",
	mode: "char-rings",
	createRenderer: (canvas) => new CharRingsRenderer(canvas),
} satisfies AnimationRoute;
