import { animate, eases } from "animejs";
import { useEffect, useRef } from "react";

const LINES = [
	{
		colStart: "col-start-1",
		start: { x: 0, y: 0 },
		control: { x: 0, y: 50 },
		end: { x: 0, y: 100 },
	},
	{
		colStart: "col-start-4",
		start: { x: 0, y: 0 },
		control: { x: 0, y: 50 },
		end: { x: 0, y: 100 },
	},
	{
		colStart: "col-start-7",
		start: { x: 0, y: 0 },
		control: { x: 0, y: 50 },
		end: { x: 0, y: 100 },
	},
	{
		colStart: "col-start-10",
		start: { x: 0, y: 0 },
		control: { x: 0, y: 50 },
		end: { x: 0, y: 100 },
	},
	{
		colStart: "col-start-12",
		start: { x: 100, y: 0 },
		control: { x: 100, y: 50 },
		end: { x: 100, y: 100 },
	},
];

const config = {
	snapDistance: 4,
	releaseDistance: 100,
	duration: 1250,
	ease: eases.outElastic(1, 0.1),
};

type Point = { x: number; y: number };
type GridLine = {
	start: Point;
	control: Point;
	end: Point;
	defaultControlX: number;
	paths: Array<SVGPathElement>;
	svg: SVGSVGElement;
	connected: boolean;
};

type Animation = ReturnType<typeof animate>;

function parsePoint(value: string | undefined) {
	const [x, y] = value?.split(",").map(Number) ?? [];
	return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function buildLines(root: HTMLElement) {
	return Array.from(root.querySelectorAll<HTMLElement>("[data-grid-line]"))
		.map((element) => {
			const start = parsePoint(element.dataset.start);
			const control = parsePoint(element.dataset.control);
			const end = parsePoint(element.dataset.end);
			const svg = element.querySelector<SVGSVGElement>("svg");
			const paths = Array.from(element.querySelectorAll<SVGPathElement>("[data-grid-path]"));

			if (!start || !control || !end || !svg || paths.length === 0) return null;

			return {
				start: { ...start },
				control: { ...control },
				end: { ...end },
				defaultControlX: control.x,
				paths,
				svg,
				connected: false,
			};
		})
		.filter((line): line is GridLine => Boolean(line));
}

function toQuadraticPath(line: GridLine) {
	const { start, control, end } = line;
	return `M${start.x} ${start.y} Q${control.x} ${control.y} ${end.x} ${end.y}`;
}

function updateLine(line: GridLine) {
	const d = toQuadraticPath(line);
	for (const path of line.paths) path.setAttribute("d", d);
}

function getSVGCoordinates(svg: SVGSVGElement, event: PointerEvent) {
	const ctm = svg.getScreenCTM();
	if (!ctm) return null;
	const point = svg.createSVGPoint();
	point.x = event.clientX;
	point.y = event.clientY;
	return point.matrixTransform(ctm.inverse());
}

function getPointOnCurve(line: GridLine, t: number) {
	const inv = 1 - t;
	const { start, control, end } = line;
	return {
		x: inv * inv * start.x + 2 * inv * t * control.x + t * t * end.x,
		y: inv * inv * start.y + 2 * inv * t * control.y + t * t * end.y,
	};
}

function clamp01(value: number) {
	return Math.max(0, Math.min(1, value));
}

function getClosestParameter(line: GridLine, point: Point) {
	const { start, control, end } = line;
	const ax = start.x - 2 * control.x + end.x;
	const ay = start.y - 2 * control.y + end.y;
	const bx = 2 * (control.x - start.x);
	const by = 2 * (control.y - start.y);
	const cx = start.x - point.x;
	const cy = start.y - point.y;

	const c0 = cx * bx + cy * by;
	const c1 = cx * 2 * ax + bx * bx + cy * 2 * ay + by * by;
	const c2 = 3 * ax * bx + 3 * ay * by;
	const c3 = 2 * ax * ax + 2 * ay * ay;

	let t = 0.5;
	for (let i = 0; i < 5; i++) {
		const g = ((c3 * t + c2) * t + c1) * t + c0;
		const gPrime = c1 + 2 * c2 * t + 3 * c3 * t * t;
		if (Math.abs(gPrime) < 1e-6) break;
		t = clamp01(t - g / gPrime);
	}

	return clamp01(t);
}

function getDistanceToLine(line: GridLine, point: Point) {
	const t = getClosestParameter(line, point);
	let minDistance = Infinity;

	for (const candidate of [0, 1, t]) {
		const curvePoint = getPointOnCurve(line, candidate);
		const distance = Math.hypot(point.x - curvePoint.x, point.y - curvePoint.y);
		if (distance < minDistance) minDistance = distance;
	}

	return minDistance;
}

export function GridBackground() {
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const lines = buildLines(root);
		const animations = new WeakMap<GridLine, Animation>();
		let activeLine: GridLine | null = null;
		let frame = 0;

		const requestRender = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				for (const line of lines) {
					if (
						line.connected &&
						Math.abs(line.control.x - line.defaultControlX) > config.releaseDistance
					) {
						releaseLine(line);
					}
					updateLine(line);
				}
			});
		};

		function stopAnimation(line: GridLine) {
			animations.get(line)?.cancel();
			animations.delete(line);
		}

		function releaseLine(line: GridLine) {
			if (!line.connected) return;
			line.connected = false;
			if (activeLine === line) activeLine = null;

			stopAnimation(line);
			animations.set(
				line,
				animate(line.control, {
					x: line.defaultControlX,
					duration: config.duration,
					ease: config.ease,
					onUpdate: requestRender,
				}),
			);
		}

		function connectLine(line: GridLine) {
			if (activeLine && activeLine !== line) releaseLine(activeLine);
			line.connected = true;
			activeLine = line;
			stopAnimation(line);
		}

		function findClosestLine(event: PointerEvent) {
			let result: { line: GridLine; distance: number } | null = null;
			for (const line of lines) {
				const point = getSVGCoordinates(line.svg, event);
				if (!point) continue;
				const distance = getDistanceToLine(line, point);
				if (!result || distance < result.distance) result = { line, distance };
			}
			return result;
		}

		function onPointerMove(event: PointerEvent) {
			const closest = findClosestLine(event);
			if (closest && closest.distance <= config.snapDistance) connectLine(closest.line);

			if (!activeLine) return;
			const point = getSVGCoordinates(activeLine.svg, event);
			if (!point) return;
			activeLine.control.x = point.x * 2 - (activeLine.start.x + activeLine.end.x) / 2;
			requestRender();
		}

		function onPointerLeave() {
			if (activeLine) releaseLine(activeLine);
		}

		window.addEventListener("pointermove", onPointerMove, { passive: true });
		window.addEventListener("pointerleave", onPointerLeave);
		window.addEventListener("pointercancel", onPointerLeave);
		requestRender();

		return () => {
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerleave", onPointerLeave);
			window.removeEventListener("pointercancel", onPointerLeave);
			if (frame) window.cancelAnimationFrame(frame);
			for (const line of lines) stopAnimation(line);
		};
	}, []);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 overflow-hidden"
			ref={rootRef}
		>
			<div className="grid size-full grid-cols-12 gap-6 px-8 md:px-32">
				{LINES.map((line, index) => (
					<div
						className={`${line.colStart} relative`}
						data-control={`${line.control.x},${line.control.y}`}
						data-end={`${line.end.x},${line.end.y}`}
						data-grid-line={index}
						data-start={`${line.start.x},${line.start.y}`}
						key={line.colStart}
					>
						<svg
							aria-hidden="true"
							className="size-full overflow-visible"
							fill="none"
							preserveAspectRatio="none"
							viewBox="0 0 100 100"
						>
							<path
								className="stroke-muted-foreground/15"
								data-grid-path
								d={`M${line.start.x},${line.start.y} Q${line.control.x},${line.control.y} ${line.end.x},${line.end.y}`}
								strokeDasharray="5 3"
								strokeWidth="0.75"
								vectorEffect="non-scaling-stroke"
							/>
						</svg>
					</div>
				))}
			</div>
		</div>
	);
}
