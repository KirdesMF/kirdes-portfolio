import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const SpotlightHiddenAnimation = {
	path: "/lab/spotlight-hidden",
	label: "Hidden Spotlight Decode",
	mode: "spotlight-hidden",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "spotlight-hidden"),
} satisfies AnimationRoute;
