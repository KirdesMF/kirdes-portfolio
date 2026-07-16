import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const GodLightAnimation = {
	path: "/lab/god-light",
	label: "God Light Reveal",
	mode: "god-light",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "god-light"),
} satisfies AnimationRoute;
