import { BeadCurtainRenderer } from "../webgl/effects/bead-curtain";
import type { AnimationRoute } from "../webgl-text";

export const BeadCurtainAnimation = {
	path: "/lab/bead-curtain",
	label: "Bead Curtain",
	mode: "bead-curtain",
	createRenderer: (canvas) => new BeadCurtainRenderer(canvas),
} satisfies AnimationRoute;
