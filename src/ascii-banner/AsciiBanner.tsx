import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { ScrambleText } from "#/design-system/ScrambleText";
import { BANNER_ART } from "./bannerArt";
import {
	ASCII_BANNER_FONT_FAMILY,
	ASCII_BANNER_FRAME_INTERVAL_MS,
	ASCII_BANNER_MAX_DPR,
	DEFAULT_BANNER_COLORS,
	DEFAULT_BANNER_EFFECTS,
	DEFAULT_BANNER_SHIMMER,
} from "./bannerConfig";
import {
	type AsciiBannerColors,
	type AsciiBannerEffects,
	type AsciiBannerShimmer,
	drawAsciiBanner,
} from "./drawAsciiBanner";
import { useDeviceShimmer } from "./useDeviceShimmer";

export type AsciiBannerProps = {
	colors?: Partial<AsciiBannerColors>;
	effects?: Partial<AsciiBannerEffects>;
	shimmerConfig?: Partial<AsciiBannerShimmer>;
	className?: string;
	shimmer?: boolean;
	glow?: boolean;
	blur?: boolean;
};

function resolveThemeColor(element: HTMLElement, value: string | null) {
	if (!value) return null;

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

function resolveThemeColors(element: HTMLElement, colors: AsciiBannerColors): AsciiBannerColors {
	return {
		text: resolveThemeColor(element, colors.text) ?? colors.text,
		line: resolveThemeColor(element, colors.line) ?? colors.line,
		block: resolveThemeColor(element, colors.block) ?? colors.block,
		glow: resolveThemeColor(element, colors.glow) ?? colors.glow,
		background: resolveThemeColor(element, colors.background),
		shimmer: resolveThemeColor(element, colors.shimmer) ?? colors.shimmer,
	};
}

function usePrefersReducedMotion() {
	const ref = useRef(false);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => {
			ref.current = query.matches;
		};

		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return ref;
}

function CurrentYear() {
	return <ScrambleText className="tabular-nums" text={new Date().getFullYear().toString()} />;
}

export function AsciiBanner({
	colors,
	effects,
	shimmerConfig,
	className,
	shimmer = true,
	glow = true,
	blur = false,
}: AsciiBannerProps) {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const isHoveringRef = useRef(false);
	const hoverStartedAtRef = useRef(0);
	const reducedMotionRef = usePrefersReducedMotion();
	const deviceShimmer = useDeviceShimmer();
	const resolvedColors = useMemo(() => ({ ...DEFAULT_BANNER_COLORS, ...colors }), [colors]);
	const resolvedEffects = useMemo(() => ({ ...DEFAULT_BANNER_EFFECTS, ...effects }), [effects]);
	const resolvedShimmer = useMemo(
		() => ({ ...DEFAULT_BANNER_SHIMMER, ...shimmerConfig }),
		[shimmerConfig],
	);

	useEffect(() => {
		const wrapper = wrapperRef.current;
		const canvas = canvasRef.current;
		if (!wrapper || !canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrame = 0;
		let width = 0;
		let height = 0;
		let lastDraw = 0;
		let themeColors = resolveThemeColors(wrapper, resolvedColors);
		const aspectRatio =
			(BANNER_ART.rows * BANNER_ART.cellHeight) / (BANNER_ART.columns * BANNER_ART.cellWidth);

		const render = (timestamp: number) => {
			if (width <= 0 || height <= 0) return;

			const time = timestamp / 1000;
			const introDuration = resolvedShimmer.introDuration;
			const deviceShimmerPosition = deviceShimmer.getValue();
			const shimmerTime = isHoveringRef.current ? time - hoverStartedAtRef.current : time;
			const shimmerActive =
				shimmer &&
				!reducedMotionRef.current &&
				(deviceShimmerPosition !== null || time < introDuration || isHoveringRef.current);
			drawAsciiBanner(ctx, BANNER_ART, {
				width,
				height,
				columns: BANNER_ART.columns,
				rows: BANNER_ART.rows,
				originX: BANNER_ART.originX,
				originY: BANNER_ART.originY,
				fontFamily: ASCII_BANNER_FONT_FAMILY,
				colors: themeColors,
				effects: resolvedEffects,
				shimmerConfig: resolvedShimmer,
				time: shimmerTime,
				shimmer: shimmerActive,
				shimmerPosition: deviceShimmerPosition,
				glow,
				blur,
			});
		};

		const updateThemeColors = () => {
			themeColors = resolveThemeColors(wrapper, resolvedColors);
			render(performance.now());
		};

		const resize = () => {
			const rect = wrapper.getBoundingClientRect();
			const nextWidth = Math.max(1, Math.floor(rect.width));
			const nextHeight = Math.max(1, Math.floor(nextWidth * aspectRatio));
			const dpr = Math.min(window.devicePixelRatio || 1, ASCII_BANNER_MAX_DPR);
			const nextCanvasWidth = Math.floor(nextWidth * dpr);
			const nextCanvasHeight = Math.floor(nextHeight * dpr);

			width = nextWidth;
			height = nextHeight;

			if (canvas.width !== nextCanvasWidth || canvas.height !== nextCanvasHeight) {
				canvas.width = nextCanvasWidth;
				canvas.height = nextCanvasHeight;
			}

			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;

			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.imageSmoothingEnabled = true;
			render(performance.now());
		};

		const observer = new ResizeObserver(resize);
		const themeObserver = new MutationObserver(updateThemeColors);
		observer.observe(wrapper);
		themeObserver.observe(document.documentElement, {
			attributeFilter: ["class", "data-theme", "style"],
			attributes: true,
		});
		resize();

		const draw = (timestamp: number) => {
			animationFrame = window.requestAnimationFrame(draw);
			if (timestamp - lastDraw < ASCII_BANNER_FRAME_INTERVAL_MS) return;
			lastDraw = timestamp;
			render(timestamp);
		};

		animationFrame = window.requestAnimationFrame(draw);

		return () => {
			observer.disconnect();
			themeObserver.disconnect();
			window.cancelAnimationFrame(animationFrame);
		};
	}, [
		blur,
		deviceShimmer,
		glow,
		reducedMotionRef,
		resolvedColors,
		resolvedEffects,
		resolvedShimmer,
		shimmer,
	]);

	return (
		<div
			aria-label="ASCII banner"
			className={className}
			ref={wrapperRef}
			role="img"
			onMouseEnter={() => {
				isHoveringRef.current = true;
				hoverStartedAtRef.current = performance.now() / 1000;
			}}
			onMouseLeave={() => {
				isHoveringRef.current = false;
			}}
			onPointerDown={() => {
				void deviceShimmer.enable();
			}}
		>
			<div className="grid gap-1">
				<span className="justify-self-end text-status-primary text-xs leading-none">
					<ClientOnly fallback={<span className="tabular-nums">0000</span>}>
						<CurrentYear />
					</ClientOnly>
				</span>
				<canvas className="block w-full" ref={canvasRef} />
			</div>
		</div>
	);
}
