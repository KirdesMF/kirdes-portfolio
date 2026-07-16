import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const CornerSunburstAnimation = {
	path: "/lab/corner-sunburst",
	label: "Corner Sunburst",
	mode: "corner-sunburst",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "corner-sunburst"),
} satisfies AnimationRoute;
