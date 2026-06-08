import { GitBranch } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { useIdeStore } from "#/ide/store";
import { Clock } from "#/layout/clock";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusSide = "left" | "right";
type StatusVariant = "primary" | "muted";

type StatusItem = {
	id: string;
	variant: StatusVariant;
	content: ReactNode;
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const variantClass = {
	primary: {
		background: "bg-status-primary",
		foreground: "text-status-primary-foreground",
		fill: "fill-status-primary",
	},
	muted: {
		background: "bg-status-muted",
		foreground: "text-status-muted-foreground",
		fill: "fill-status-muted",
	},
} as const;

// ─── Constants ───────────────────────────────────────────────────────────────

const EDITOR_BRANCH_NAME = "feat/portfolio";

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusGroup(props: { items: StatusItem[]; side: StatusSide }) {
	return (
		<div className="flex min-w-0 items-stretch text-tiny">
			{props.items.map((item, index) => (
				<StatusSegment
					isFirst={index === 0}
					isLast={index === props.items.length - 1}
					item={item}
					key={item.id}
					side={props.side}
					stack={props.side === "left" ? props.items.length - index : index + 1}
				/>
			))}
		</div>
	);
}

function StatusSegment(props: {
	isFirst: boolean;
	isLast: boolean;
	item: StatusItem;
	side: StatusSide;
	stack: number;
}) {
	const variant = variantClass[props.item.variant];

	return (
		<div
			className={cn(
				"flex min-w-0 items-stretch z-(--status-segment-stack)",
				variant.foreground,
				props.side === "left" && !props.isFirst && "-ms-2.5",
				props.side === "right" && !props.isLast && "-me-2.5",
			)}
			style={{ "--status-segment-stack": props.stack } as CSSProperties}
		>
			{props.side === "right" && <Chevron direction="left" variant={props.item.variant} />}

			<div
				className={cn(
					"flex min-w-0 items-center gap-2",
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

			{props.side === "left" && <Chevron direction="right" variant={props.item.variant} />}
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

export function StatusBar({ currentFile }: { currentFile?: string }) {
	const cursorLine = useIdeStore((s) => s.cursorLine);
	const cursorColumn = useIdeStore((s) => s.cursorColumn);

	const leftItems: StatusItem[] = [
		{
			id: "mode",
			variant: "primary",
			content: <span className="font-medium">NORMAL</span>,
		},
		{
			id: "branch",
			variant: "muted",
			content: (
				<>
					<GitBranch className="size-3 shrink-0" />
					<span className="truncate">{EDITOR_BRANCH_NAME}</span>
				</>
			),
		},
		...(currentFile
			? [
					{
						id: "file",
						variant: "primary" as const,
						content: <span className="truncate">{currentFile}</span>,
					} as StatusItem,
				]
			: []),
	];

	const rightItems: StatusItem[] = [
		{
			id: "cursor",
			variant: "muted",
			content: (
				<span className="tabular-nums">
					L{cursorLine}:C{cursorColumn}
				</span>
			),
		},
		{
			id: "time",
			variant: "primary" as const,
			content: <Clock />,
		},
	];

	return (
		<footer className="flex h-status-bar shrink-0 items-stretch justify-between border-t border-border bg-status text-status-foreground">
			<StatusGroup items={leftItems} side="left" />
			<StatusGroup items={rightItems} side="right" />
		</footer>
	);
}
