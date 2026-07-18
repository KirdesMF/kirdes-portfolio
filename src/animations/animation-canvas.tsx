import { useEffect, useRef } from "react";

import { startAnimationLoop } from "./animation-loop";
import type { AnimationRoute } from "./webgl-text";

export function AnimationCanvas({
	route,
	className,
}: {
	route: AnimationRoute;
	className?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		let stopAnimation: (() => void) | undefined;
		const startAnimation = () => {
			stopAnimation?.();
			stopAnimation = startAnimationLoop(route.createRenderer(canvas), canvas);
		};
		const handleContextLost = (event: Event) => {
			event.preventDefault();
			stopAnimation?.();
			stopAnimation = undefined;
		};
		const handleContextRestored = () => startAnimation();

		canvas.addEventListener("webglcontextlost", handleContextLost);
		canvas.addEventListener("webglcontextrestored", handleContextRestored);
		startAnimation();

		return () => {
			canvas.removeEventListener("webglcontextlost", handleContextLost);
			canvas.removeEventListener("webglcontextrestored", handleContextRestored);
			stopAnimation?.();
		};
	}, [route]);

	return <canvas key={route.mode} ref={canvasRef} className={className ?? "block size-full"} />;
}
