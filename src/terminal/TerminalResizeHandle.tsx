import type { KeyboardEvent, PointerEvent } from "react";
import { cn } from "#/design-system/cn";
import type { ResizeAxis } from "#/terminal/useResizablePanels";

export function TerminalResizeHandle({
	axis,
	className,
	onKeyResize,
	onResizeStart,
	value,
}: {
	axis: ResizeAxis;
	className?: string;
	onKeyResize?: (delta: number) => void;
	onResizeStart: (event: PointerEvent<HTMLDivElement>) => void;
	value: number;
}) {
	const vertical = axis === "horizontal";

	function handleKeyDown(event: KeyboardEvent<HTMLHRElement>) {
		const sign = event.shiftKey ? 10 : 2;
		const delta =
			event.key === "ArrowRight" || event.key === "ArrowDown"
				? sign
				: event.key === "ArrowLeft" || event.key === "ArrowUp"
					? -sign
					: 0;
		if (!delta) return;
		event.preventDefault();
		onKeyResize?.(delta);
	}

	return (
		<div
			className={cn(
				"group z-raised hidden shrink-0 touch-none md:flex",
				vertical ? "w-2 -mx-1 cursor-col-resize" : "h-2 -my-1 cursor-row-resize",
				className,
			)}
			onPointerDown={onResizeStart}
		>
			<hr
				aria-label={
					vertical ? "Resize terminal and browser panes" : "Resize browser and editor panes"
				}
				aria-orientation={vertical ? "vertical" : "horizontal"}
				aria-valuemax={75}
				aria-valuemin={25}
				aria-valuenow={value}
				className={cn(
					"m-0 shrink-0 border-0 bg-border/60 outline-none transition-colors group-hover:bg-primary/60 focus-visible:bg-primary",
					vertical
						? "h-full w-px cursor-col-resize self-stretch mx-auto"
						: "h-px w-full cursor-row-resize self-center",
				)}
				tabIndex={0}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
}
