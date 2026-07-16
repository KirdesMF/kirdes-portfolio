import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const RadarHaloAnimation = {
	path: "/lab/radar-halo",
	label: "Radar Halo",
	mode: "radar-halo",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "radar-halo"),
} satisfies AnimationRoute;
