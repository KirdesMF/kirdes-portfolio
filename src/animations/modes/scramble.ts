import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const ScrambleAnimation = {
	path: "/lab/scramble",
	label: "Current Scramble",
	mode: "scramble",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "scramble"),
} satisfies AnimationRoute;
