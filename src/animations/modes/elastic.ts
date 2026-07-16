import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const ElasticAnimation = {
	path: "/lab/elastic",
	label: "Elastic Lines",
	mode: "elastic",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "elastic"),
} satisfies AnimationRoute;
