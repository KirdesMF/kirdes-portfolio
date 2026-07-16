import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const InterferenceAnimation = {
	path: "/lab/interference",
	label: "Interference Grid",
	mode: "interference",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "interference"),
} satisfies AnimationRoute;
