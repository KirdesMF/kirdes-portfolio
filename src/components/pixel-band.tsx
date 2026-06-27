import { useEffect, useRef } from "react";

type PixelBandProps = {
	cellSize?: number;
	className?: string;
	density?: number;
	height?: number;
};

type Pixel = {
	alpha: number;
	phase: number;
};

type Shimmer = {
	start: number;
};

const maxDpr = 1.5;
const frameInterval = 1000 / 24;
const shimmerDuration = 650;
const shimmerWidth = 56;
const shimmerSkew = 0.75;
const introDuration = 420;
const introRowStagger = 32;

function resolveColor(element: HTMLElement, value: string) {
	const probe = document.createElement("span");
	probe.style.color = value;
	probe.style.position = "absolute";
	probe.style.pointerEvents = "none";
	probe.style.visibility = "hidden";
	element.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	probe.remove();

	return resolved || value;
}

function createPixels(columns: number, rows: number, intensity: number): Pixel[] {
	return Array.from({ length: columns * rows }, (_, index) => {
		const x = index % columns;
		const y = Math.floor(index / columns);
		const seeded = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453;
		const random = seeded - Math.floor(seeded);
		const progress = rows <= 1 ? 0 : y / (rows - 1);
		const gradient = (1 - progress) ** 1.8;

		return {
			alpha: Math.max(0.04, gradient * intensity * (0.72 + random * 0.28)),
			phase: random * Math.PI * 2,
		};
	});
}

export function PixelBand({
	cellSize = 4,
	className,
	density = 0.58,
	height = 96,
}: PixelBandProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const canvasElement = canvas;
		const context = ctx;
		const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		let animationFrame = 0;
		let resizeFrame = 0;
		let lastFrame = 0;
		let columns = 0;
		let rows = 0;
		let pixels: Pixel[] = [];
		let shimmers: Shimmer[] = [];
		let introStart = performance.now();
		let color = resolveColor(canvas, "var(--primary)");

		function easeOutCubic(value: number) {
			return 1 - (1 - value) ** 3;
		}

		function draw(timestamp: number) {
			const width = canvasElement.clientWidth;
			const canvasHeight = canvasElement.clientHeight;
			context.clearRect(0, 0, width, canvasHeight);

			shimmers = shimmers.filter((shimmer) => timestamp - shimmer.start < shimmerDuration);

			for (let y = 0; y < rows; y++) {
				const rowDelay = y * introRowStagger;
				const rowProgress = reduceMotionQuery.matches
					? 1
					: Math.max(0, Math.min(1, (timestamp - introStart - rowDelay) / introDuration));
				const rowEase = easeOutCubic(rowProgress);
				const rowOffset = (1 - rowEase) * cellSize * 2;

				for (let x = 0; x < columns; x++) {
					const pixel = pixels[y * columns + x];
					if (!pixel || pixel.alpha <= 0) continue;

					const cellX = x * cellSize;
					const cellY = y * cellSize + rowOffset;
					const pulse = reduceMotionQuery.matches
						? 0
						: (Math.sin(timestamp / 900 + pixel.phase) + 1) / 2;
					const shimmerAlpha = reduceMotionQuery.matches
						? 0
						: shimmers.reduce((alpha, shimmer) => {
								const elapsed = timestamp - shimmer.start;
								const progress = elapsed / shimmerDuration;
								const bandX = -shimmerWidth + progress * (width + shimmerWidth * 2);
								const diagonalX = cellX + cellY * shimmerSkew;
								const distance = Math.abs(diagonalX - bandX);
								const wave = Math.max(0, 1 - distance / shimmerWidth) ** 2;

								return Math.max(alpha, wave * (1 - progress * 0.35));
							}, 0);
					context.globalAlpha = Math.min(
						1,
						(pixel.alpha * (0.45 + pulse * 0.55) + shimmerAlpha * 0.8) * rowEase,
					);
					context.fillStyle = color;
					context.fillRect(cellX, cellY, Math.max(1, cellSize - 1), Math.max(1, cellSize - 1));
				}
			}

			context.globalAlpha = 1;
		}

		function resize() {
			const rect = canvasElement.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
			const nextWidth = Math.max(1, Math.floor(rect.width));
			const nextHeight = Math.max(1, Math.floor(rect.height));
			const nextCanvasWidth = Math.floor(nextWidth * dpr);
			const nextCanvasHeight = Math.floor(nextHeight * dpr);

			if (canvasElement.width !== nextCanvasWidth || canvasElement.height !== nextCanvasHeight) {
				canvasElement.width = nextCanvasWidth;
				canvasElement.height = nextCanvasHeight;
			}

			context.setTransform(dpr, 0, 0, dpr, 0, 0);
			columns = Math.ceil(nextWidth / cellSize);
			rows = Math.ceil(nextHeight / cellSize);
			pixels = createPixels(columns, rows, density);
			introStart = performance.now();
			color = resolveColor(canvasElement, "var(--primary)");
			draw(performance.now());
		}

		function scheduleResize() {
			if (resizeFrame) return;
			resizeFrame = window.requestAnimationFrame(() => {
				resizeFrame = 0;
				resize();
			});
		}

		function addShimmer() {
			if (reduceMotionQuery.matches) return;
			shimmers.push({ start: performance.now() });
		}

		function animate(timestamp: number) {
			animationFrame = window.requestAnimationFrame(animate);
			if (timestamp - lastFrame < frameInterval) return;
			lastFrame = timestamp;
			draw(timestamp);
		}

		const observer = new ResizeObserver(scheduleResize);
		const themeObserver = new MutationObserver(scheduleResize);
		observer.observe(canvasElement);
		canvasElement.addEventListener("pointerenter", addShimmer);
		themeObserver.observe(document.documentElement, {
			attributeFilter: ["class", "data-theme", "style"],
			attributes: true,
		});
		resize();
		animationFrame = window.requestAnimationFrame(animate);

		return () => {
			observer.disconnect();
			themeObserver.disconnect();
			canvasElement.removeEventListener("pointerenter", addShimmer);
			window.cancelAnimationFrame(animationFrame);
			if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
		};
	}, [cellSize, density]);

	return <canvas className={className} ref={canvasRef} style={{ height }} />;
}
