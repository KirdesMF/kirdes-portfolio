export type AnimationRenderer = {
	resize(): void;
	render(timestamp: number): void;
	dispose(): void;
};

export function startAnimationLoop(renderer: AnimationRenderer, target?: Element) {
	let frame = 0;
	let disposed = false;

	const resize = () => renderer.resize();
	const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
	const render = (timestamp: number) => {
		if (disposed) {
			return;
		}

		renderer.render(timestamp);
		frame = requestAnimationFrame(render);
	};

	void document.fonts.ready.then(() => {
		if (disposed) {
			return;
		}

		resize();
		frame = requestAnimationFrame(render);
	});

	window.addEventListener("resize", resize);
	if (target) {
		resizeObserver?.observe(target);
		if (target.parentElement) {
			resizeObserver?.observe(target.parentElement);
		}
	}

	return () => {
		disposed = true;
		cancelAnimationFrame(frame);
		window.removeEventListener("resize", resize);
		resizeObserver?.disconnect();
		renderer.dispose();
	};
}
