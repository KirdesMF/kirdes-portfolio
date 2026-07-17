import { ClockIcon, GitBranch, MouseIcon } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { Clock } from "#/components/clock/clock";
import { cn } from "#/design-system/cn";
import { useAppStore } from "#/store";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusSide = "left" | "right";
type StatusVariant = "primary" | "muted" | "activePrimary" | "activeMuted";

type StatusItem = {
	id: string;
	variant: StatusVariant;
	content: ReactNode;
	className?: string;
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const variantClass = {
	primary: {
		background: "bg-status-primary",
		foreground: "text-status-primary-foreground",
		fill: "fill-status-primary",
	},
	activePrimary: {
		background: "bg-active-background",
		foreground: "text-active-foreground",
		fill: "fill-active-background",
	},
	activeMuted: {
		background: "bg-active-foreground",
		foreground: "text-active-background",
		fill: "fill-active-foreground",
	},
	muted: {
		background: "bg-status-muted",
		foreground: "text-status-muted-foreground",
		fill: "fill-status-muted",
	},
} as const;

// ─── Constants ───────────────────────────────────────────────────────────────

const BRANCH_NAME = "feat/portfolio";

type MousePosition = { x: number; y: number };

function useMousePosition(): MousePosition {
	const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
	const nextPositionRef = useRef(position);
	const frameRef = useRef(0);

	useEffect(() => {
		function updatePosition(event: PointerEvent) {
			nextPositionRef.current = {
				x: Math.round(event.clientX),
				y: Math.round(event.clientY),
			};

			if (frameRef.current) return;
			frameRef.current = window.requestAnimationFrame(() => {
				frameRef.current = 0;
				setPosition(nextPositionRef.current);
			});
		}

		window.addEventListener("pointermove", updatePosition, { passive: true });
		return () => {
			window.removeEventListener("pointermove", updatePosition);
			if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
		};
	}, []);

	return position;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusGroup(props: {
	shellMode: "normal" | "command";
	items: StatusItem[];
	side: StatusSide;
}) {
	return (
		<div className="flex min-w-0 items-stretch text-tiny">
			{props.items.map((item, index) => (
				<StatusSegment
					shellMode={props.shellMode}
					isFirst={index === 0}
					isLast={index === props.items.length - 1}
					item={item}
					key={item.id}
					side={props.side}
					stack={props.side === "left" ? props.items.length - index : index + 1}
					className={item.className}
				/>
			))}
		</div>
	);
}

function StatusSegment(props: {
	shellMode: "normal" | "command";
	isFirst: boolean;
	isLast: boolean;
	item: StatusItem;
	side: StatusSide;
	stack: number;
	className?: string;
}) {
	const effectiveVariant =
		props.shellMode === "command"
			? props.item.variant === "primary"
				? "activePrimary"
				: "activeMuted"
			: props.item.variant;
	const variant = variantClass[effectiveVariant];

	return (
		<div
			className={cn(
				"flex min-w-0 items-stretch z-(--status-segment-stack)",
				variant.foreground,
				props.side === "left" && !props.isFirst && "-ms-2.5",
				props.side === "right" && !props.isLast && "-me-2.5",
				props.className,
			)}
			style={{ "--status-segment-stack": props.stack } as CSSProperties}
		>
			{props.side === "right" && <Chevron direction="left" variant={effectiveVariant} />}

			<div
				className={cn(
					"flex min-w-0 items-center gap-1",
					variant.background,
					props.side === "left" && props.isFirst && "ps-2 pe-4",
					props.side === "left" && !props.isFirst && "pe-4 ps-5",
					props.side === "right" && "ps-3",
					props.side === "right" && !props.isLast && "pe-5",
					props.side === "right" && props.isLast && "pe-4",
				)}
			>
				{props.item.content}
			</div>

			{props.side === "left" && <Chevron direction="right" variant={effectiveVariant} />}
		</div>
	);
}

function Chevron(props: { direction: "left" | "right"; variant: StatusVariant }) {
	return (
		<svg
			aria-hidden="true"
			className={cn("h-full w-2.5 shrink-0", variantClass[props.variant].fill)}
			preserveAspectRatio="none"
			viewBox="0 0 16 20"
		>
			<polygon points={props.direction === "left" ? "16,0 0,10 16,20" : "0,0 16,10 0,20"} />
		</svg>
	);
}

// ─── Main component ──────────────────────────────────────────────────────────

export function StatusBar() {
	const shellMode = useAppStore((s) => s.shellMode);
	const mousePosition = useMousePosition();

	const leftItems: StatusItem[] = [
		{
			id: "mode",
			variant: "primary",
			content: <span className="font-medium">{shellMode.toUpperCase()}</span>,
		},
		{
			id: "branch",
			variant: "muted",
			content: (
				<>
					<GitBranch className="size-3 shrink-0" />
					<span className="truncate">{BRANCH_NAME}</span>
				</>
			),
		},
	];

	const rightItems: StatusItem[] = [
		{
			id: "mouse-position",
			variant: "muted",
			content: (
				<>
					<MouseIcon className="size-3 shrink-0" />
					<span className="inline-block w-[9ch] text-end tabular-nums">
						{mousePosition.x}:{mousePosition.y}
					</span>
				</>
			),
			className: "hidden sm:flex",
		},
		{
			id: "time",
			variant: "primary" as const,
			content: (
				<>
					<ClockIcon className="size-3 shrink-0" />
					<span className="font-medium">
						<Clock />
					</span>
				</>
			),
		},
	];

	return (
		<footer className="flex h-status-bar shrink-0 items-stretch justify-between border-t-thin border-border bg-status text-status-foreground">
			<StatusGroup shellMode={shellMode} items={leftItems} side="left" />
			<StatusGroup shellMode={shellMode} items={rightItems} side="right" />
		</footer>
	);
}
