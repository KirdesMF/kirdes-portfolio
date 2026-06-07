import { type PointerEvent as ReactPointerEvent, useCallback, useRef, useState } from "react";

export const DEFAULT_TERMINAL_PANE_SIZE = 50;
export const DEFAULT_ROUTE_PANE_SIZE = 50;
export const MIN_PANE_SIZE = 25;
export const MAX_PANE_SIZE = 75;

export type ResizeAxis = "horizontal" | "vertical";
export type ResizeTarget = "terminal" | "route";

export function clampPaneSize(size: number) {
	return Math.min(MAX_PANE_SIZE, Math.max(MIN_PANE_SIZE, size));
}

function getSizeFromPointer(args: {
	axis: ResizeAxis;
	container: HTMLElement;
	event: PointerEvent | ReactPointerEvent;
}) {
	const rect = args.container.getBoundingClientRect();
	const rawSize =
		args.axis === "horizontal"
			? ((args.event.clientX - rect.left) / rect.width) * 100
			: ((args.event.clientY - rect.top) / rect.height) * 100;

	return clampPaneSize(rawSize);
}

export function useResizablePanels() {
	const [terminalPaneSize, setTerminalPaneSize] = useState(DEFAULT_TERMINAL_PANE_SIZE);
	const [routePaneSize, setRoutePaneSize] = useState(DEFAULT_ROUTE_PANE_SIZE);
	const frameRef = useRef(0);
	const latestSizeRef = useRef(DEFAULT_TERMINAL_PANE_SIZE);
	const cleanupRef = useRef<(() => void) | null>(null);

	const cancelFrame = useCallback(() => {
		if (frameRef.current) {
			window.cancelAnimationFrame(frameRef.current);
			frameRef.current = 0;
		}
	}, []);

	const cleanup = useCallback(() => {
		cleanupRef.current?.();
		cleanupRef.current = null;
		cancelFrame();
	}, [cancelFrame]);

	const startResize = useCallback(
		(args: {
			axis: ResizeAxis;
			container: HTMLElement | null;
			event: ReactPointerEvent;
			target: ResizeTarget;
		}) => {
			const { axis, container, event, target } = args;
			if (!container) return;

			cleanup();
			event.preventDefault();
			event.currentTarget.setPointerCapture(event.pointerId);

			const property = target === "terminal" ? "--terminal-pane-size" : "--route-pane-size";
			const commit = target === "terminal" ? setTerminalPaneSize : setRoutePaneSize;

			const applySize = (size: number) => {
				latestSizeRef.current = size;
				if (frameRef.current) return;

				frameRef.current = window.requestAnimationFrame(() => {
					frameRef.current = 0;
					container.style.setProperty(property, `${latestSizeRef.current}%`);
				});
			};

			const handleMove = (moveEvent: PointerEvent) => {
				applySize(getSizeFromPointer({ axis, container, event: moveEvent }));
			};

			const handleUp = (upEvent: PointerEvent) => {
				const finalSize = getSizeFromPointer({ axis, container, event: upEvent });
				cancelFrame();
				container.style.setProperty(property, `${finalSize}%`);
				commit(finalSize);
				cleanup();
			};

			window.addEventListener("pointermove", handleMove);
			window.addEventListener("pointerup", handleUp, { once: true });
			cleanupRef.current = () => {
				window.removeEventListener("pointermove", handleMove);
				window.removeEventListener("pointerup", handleUp);
			};

			applySize(getSizeFromPointer({ axis, container, event }));
		},
		[cancelFrame, cleanup],
	);

	const resizeByKeyboard = useCallback(
		(args: { container: HTMLElement | null; delta: number; target: ResizeTarget }) => {
			const { container, delta, target } = args;
			const property = target === "terminal" ? "--terminal-pane-size" : "--route-pane-size";
			const currentSize = target === "terminal" ? terminalPaneSize : routePaneSize;
			const nextSize = clampPaneSize(currentSize + delta);

			container?.style.setProperty(property, `${nextSize}%`);
			if (target === "terminal") {
				setTerminalPaneSize(nextSize);
			} else {
				setRoutePaneSize(nextSize);
			}
		},
		[routePaneSize, terminalPaneSize],
	);

	return {
		cleanup,
		resizeByKeyboard,
		routePaneSize,
		startResize,
		terminalPaneSize,
	};
}
