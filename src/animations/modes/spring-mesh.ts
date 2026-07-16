import { type AnimationRoute, TextCanvasRenderer } from "../webgl-text";

export const SpringMeshAnimation = {
	path: "/lab/spring-mesh",
	label: "Spring Mesh Typography",
	mode: "spring-mesh",
	createRenderer: (canvas) => new TextCanvasRenderer(canvas, "spring-mesh"),
} satisfies AnimationRoute;
