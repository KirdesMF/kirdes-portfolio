export type AnimationRenderer = {
	resize(): void;
	render(timestamp: number): void;
	dispose(): void;
	setVisible?(visible: boolean): void;
};

type RenderSize = {
	width: number;
	height: number;
	dpr: number;
};

export function startAnimationLoop(renderer: AnimationRenderer, target?: Element) {
	let frame: number | null = null;
	let disposed = false;
	let needsResize = true;
	let lastSize: RenderSize | null = null;
	let lastRenderTime = 0;
	const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

	function schedule() {
		if (disposed || frame !== null) return;
		frame = requestAnimationFrame(render);
	}

	function cancel() {
		if (frame === null) return;
		cancelAnimationFrame(frame);
		frame = null;
	}

	function handleResize() {
		needsResize = true;
		schedule();
	}

	function render(timestamp: number) {
		frame = null;
		if (disposed) return;

		const size = getRenderSize(target);
		if (!size) {
			schedule();
			return;
		}

		if (needsResize || hasSizeChanged(lastSize, size)) {
			renderer.resize();
			lastSize = size;
			needsResize = false;
		}

		if (!reducedMotionQuery.matches || timestamp - lastRenderTime >= 100) {
			lastRenderTime = timestamp;
			renderer.render(timestamp);
		}
		schedule();
	}

	const resizeObserver =
		typeof ResizeObserver === "undefined" ? null : new ResizeObserver(handleResize);

	window.addEventListener("resize", handleResize);
	reducedMotionQuery.addEventListener("change", handleResize);

	if (target) {
		resizeObserver?.observe(target);
		if (target.parentElement) resizeObserver?.observe(target.parentElement);
	}

	void document.fonts.ready.then(() => {
		if (!disposed) handleResize();
	});

	schedule();

	return () => {
		disposed = true;
		cancel();
		window.removeEventListener("resize", handleResize);
		reducedMotionQuery.removeEventListener("change", handleResize);
		resizeObserver?.disconnect();
		renderer.dispose();
	};
}

function getRenderSize(target?: Element): RenderSize | null {
	if (!target) {
		return {
			width: 1,
			height: 1,
			dpr: getDevicePixelRatio(),
		};
	}

	const rect = target.getBoundingClientRect();
	const width = Math.floor(rect.width);
	const height = Math.floor(rect.height);

	if (width <= 0 || height <= 0) return null;

	return {
		width,
		height,
		dpr: getDevicePixelRatio(),
	};
}

function hasSizeChanged(previous: RenderSize | null, next: RenderSize) {
	return (
		!previous ||
		previous.width !== next.width ||
		previous.height !== next.height ||
		previous.dpr !== next.dpr
	);
}

function getDevicePixelRatio() {
	return Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
}
