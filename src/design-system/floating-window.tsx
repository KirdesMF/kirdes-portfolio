import { type PointerEvent, type ReactNode, useState } from "react";
import { cn } from "#/design-system/cn";

type Position = { x: number; y: number };

type FloatingWindowProps = {
	children: ReactNode;
	className?: string;
	isActive: boolean;
	onClose: () => void;
	onFocus: () => void;
	title: string;
};

export function FloatingWindow({
	children,
	className,
	isActive,
	onClose,
	onFocus,
	title,
}: FloatingWindowProps) {
	const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

	function handlePointerDown(event: PointerEvent<HTMLElement>) {
		onFocus();
		const startX = event.clientX;
		const startY = event.clientY;
		const startPosition = position;
		event.currentTarget.setPointerCapture(event.pointerId);

		function handlePointerMove(moveEvent: globalThis.PointerEvent) {
			setPosition({
				x: startPosition.x + moveEvent.clientX - startX,
				y: startPosition.y + moveEvent.clientY - startY,
			});
		}

		function handlePointerUp() {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
		}

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp, { once: true });
	}

	return (
		<section
			className={cn(
				"pointer-events-auto fixed max-h-[min(90dvh,42rem)] -translate-1/2 bg-popover p-3 text-popover-foreground outline-none",
				isActive ? "z-window-active" : "z-window",
				className,
			)}
			style={{
				transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
			}}
			onPointerDown={onFocus}
		>
			<div className="relative border-thin border-border bg-popover p-4">
				<h2
					className="absolute top-0 inset-s-1/2 z-raised -translate-1/2 cursor-grab border-x-thin border-border bg-popover px-2 text-primary text-tiny leading-none select-none active:cursor-grabbing"
					onPointerDown={handlePointerDown}
				>
					{title}
				</h2>
				<button
					aria-label={`Close ${title.toLowerCase()} window`}
					className="absolute top-0 end-3 z-raised -translate-y-1/2 bg-popover px-1 text-primary text-tiny leading-none focus:text-accent-foreground focus:outline-none"
					type="button"
					onClick={onClose}
				>
					[X]
				</button>
				<div className="text-tiny leading-5">{children}</div>
			</div>
		</section>
	);
}

export function FloatingWindowLayer({ children }: { children: ReactNode }) {
	return <div className="pointer-events-none fixed inset-0 z-window">{children}</div>;
}
