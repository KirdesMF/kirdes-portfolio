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
	onResizeStart: (event: PointerEvent<HTMLButtonElement>) => void;
	value: number;
}) {
	const vertical = axis === "horizontal";

	function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
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
		<button
			aria-label={
				vertical ? "Resize terminal and browser panes" : "Resize browser and editor panes"
			}
			aria-orientation={vertical ? "vertical" : "horizontal"}
			aria-valuemax={75}
			aria-valuemin={25}
			aria-valuenow={value}
			className={cn(
				"group z-20 hidden shrink-0 touch-none bg-border/60 outline-none transition-colors hover:bg-primary/60 focus-visible:bg-primary md:block",
				vertical ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
				className,
			)}
			role="separator"
			type="button"
			onKeyDown={handleKeyDown}
			onPointerDown={onResizeStart}
		>
			<span
				aria-hidden="true"
				className={cn(
					"block bg-transparent transition-colors group-hover:bg-primary/20 group-focus-visible:bg-primary/20",
					vertical ? "-mx-1 h-full w-2" : "-my-1 h-2 w-full",
				)}
			/>
		</button>
	);
}
