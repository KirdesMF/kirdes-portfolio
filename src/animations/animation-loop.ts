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
	let frame = 0;
	let disposed = false;
	let focused = document.hasFocus();
	let intersecting = true;
	let needsResize = true;
	let lastSize: RenderSize | null = null;

	const isActive = () => document.visibilityState === "visible" && focused && intersecting;
	const resize = () => {
		needsResize = true;
	};
	const stopFrame = () => {
		if (!frame) return;
		cancelAnimationFrame(frame);
		frame = 0;
	};
	const scheduleFrame = () => {
		if (disposed || frame || !isActive()) return;
		frame = requestAnimationFrame(render);
	};
	const syncActiveState = () => {
		if (isActive()) {
			renderer.setVisible?.(true);
			resize();
			scheduleFrame();
			return;
		}

		stopFrame();
		renderer.setVisible?.(false);
	};
	const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
	const intersectionObserver =
		target && typeof IntersectionObserver !== "undefined"
			? new IntersectionObserver(([entry]) => {
					intersecting = entry?.isIntersecting ?? true;
					syncActiveState();
				})
			: null;
	const render = (timestamp: number) => {
		frame = 0;

		if (disposed || !isActive()) {
			syncActiveState();
			return;
		}

		const size = getRenderSize(target);

		if (!size) {
			scheduleFrame();
			return;
		}

		if (needsResize || hasSizeChanged(lastSize, size)) {
			renderer.resize();
			lastSize = size;
			needsResize = false;
		}

		renderer.render(timestamp);
		scheduleFrame();
	};
	const handleVisibilityChange = () => syncActiveState();
	const handleFocus = () => {
		focused = true;
		syncActiveState();
	};
	const handleBlur = () => {
		focused = false;
		syncActiveState();
	};

	window.addEventListener("resize", resize);
	document.addEventListener("visibilitychange", handleVisibilityChange);
	window.addEventListener("focus", handleFocus);
	window.addEventListener("blur", handleBlur);

	if (target) {
		resizeObserver?.observe(target);
		intersectionObserver?.observe(target);
		if (target.parentElement) {
			resizeObserver?.observe(target.parentElement);
		}
	}

	void document.fonts.ready.then(() => {
		if (!disposed) resize();
	});

	syncActiveState();

	return () => {
		disposed = true;
		stopFrame();
		window.removeEventListener("resize", resize);
		document.removeEventListener("visibilitychange", handleVisibilityChange);
		window.removeEventListener("focus", handleFocus);
		window.removeEventListener("blur", handleBlur);
		resizeObserver?.disconnect();
		intersectionObserver?.disconnect();
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

	if (width <= 0 || height <= 0) {
		return null;
	}

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
