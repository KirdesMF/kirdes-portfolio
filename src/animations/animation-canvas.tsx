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

		if (!canvas) {
			return;
		}

		const renderer = route.createRenderer(canvas);

		return startAnimationLoop(renderer, canvas);
	}, [route]);

	return <canvas key={route.mode} ref={canvasRef} className={className ?? "block size-full"} />;
}
