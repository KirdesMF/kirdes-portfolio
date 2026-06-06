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
	onResizeStart: (event: PointerEvent<HTMLHRElement>) => void;
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
		<hr
			aria-label={
				vertical ? "Resize terminal and browser panes" : "Resize browser and editor panes"
			}
			aria-orientation={vertical ? "vertical" : "horizontal"}
			aria-valuemax={75}
			aria-valuemin={25}
			aria-valuenow={value}
			className={cn(
				"relative z-20 hidden shrink-0 touch-none border-0 bg-border/60 outline-none transition-colors hover:bg-primary/60 focus-visible:bg-primary md:block",
				"before:absolute before:bg-transparent before:content-['']",
				vertical
					? "w-px cursor-col-resize before:-inset-x-1 before:inset-y-0"
					: "h-px cursor-row-resize before:-inset-y-1 before:inset-x-0",
				className,
			)}
			tabIndex={0}
			onKeyDown={handleKeyDown}
			onPointerDown={onResizeStart}
		/>
	);
}
