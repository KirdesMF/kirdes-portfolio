import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const SpotlightAnimation = {
	path: "/lab/spotlight",
	label: "Spotlight Decode",
	mode: "spotlight",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "spotlight"),
} satisfies AnimationRoute;
