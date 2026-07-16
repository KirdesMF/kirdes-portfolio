import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const ScanlineAnimation = {
	path: "/lab/scanline",
	label: "Scanline Reveal",
	mode: "scanline",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "scanline"),
} satisfies AnimationRoute;
