import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ClockIcon, FileTerminal, SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { Clock } from "#/layout/Clock";
import { setLocale } from "#/paraglide/runtime";
import { SettingsDialog } from "#/settings-dialog";
import { terminalNavigationItems } from "#/terminal/terminal-routes";

type StatusSide = "left" | "right";
type StatusVariant = "primary" | "muted";

type StatusItem = {
	id: string;
	variant: StatusVariant;
	content: ReactNode;
};

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

export function AppHeader() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { dialog?: string };
	const settingsOpen = search.dialog === "settings";

	function setSettingsOpen(open: boolean) {
		// biome-ignore lint/suspicious/noExplicitAny: route search is shared across nested terminal routes.
		void (navigate as any)({
			search: (previous: Record<string, unknown>) => ({
				...previous,
				dialog: open ? "settings" : undefined,
			}),
		});
	}
	const leftItems: StatusItem[] = terminalNavigationItems.map(({ command, label, to }, index) => {
		const variant: StatusVariant = index % 2 === 0 ? "primary" : "muted";
		const linkClassName = getNavigationLinkClassName(variant);
		const activeLinkClassName = getNavigationActiveLinkClassName(variant);

		return {
			id: command,
			variant,
			content: (
				<Link
					activeOptions={{ exact: true }}
					activeProps={{
						className: activeLinkClassName,
					}}
					className={linkClassName}
					search={(previous) => ({
						...previous,
						activeFile: previous.activeFile,
						editor: previous.editor,
						files: previous.files ?? [],
						panel: "route",
					})}
					to={to}
				>
					{label === "~" ? label : `${label}/`}
				</Link>
			),
		};
	});
	const editorVariant: StatusVariant = leftItems.length % 2 === 0 ? "primary" : "muted";
	leftItems.push({
		id: "editor",
		variant: editorVariant,
		content: (
			<Link
				activeOptions={{ includeSearch: true }}
				activeProps={{ className: getNavigationActiveLinkClassName(editorVariant) }}
				aria-label="Open editor"
				className={getNavigationLinkClassName(editorVariant)}
				search={(previous) => ({
					...previous,
					activeFile: previous.activeFile,
					editor: "open",
					files: previous.files ?? [],
					panel: "editor",
				})}
				to="."
			>
				<span className="flex items-center gap-1">
					<FileTerminal className="size-3" />
					<span className="sr-only">editor</span>
				</span>
			</Link>
		),
	});
	const rightItems: StatusItem[] = [
		{
			id: "language",
			variant: "muted",
			content: (
				<div className="flex items-center gap-1.5">
					<button type="button" onClick={() => setLocale("fr")}>
						FR
					</button>
					<span>|</span>
					<button type="button" onClick={() => setLocale("en")}>
						EN
					</button>
				</div>
			),
		},
		{
			id: "settings",
			variant: "primary",
			content: (
				<button
					aria-label="Open settings"
					className="inline-flex size-4 items-center justify-center rounded-sm opacity-80 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
					type="button"
					onClick={() => setSettingsOpen(true)}
				>
					<SettingsIcon className="size-3" />
				</button>
			),
		},
		{
			id: "clock",
			variant: "muted",
			content: (
				<>
					<ClockIcon className="size-3" />
					<Clock />
				</>
			),
		},
	];

	return (
		<>
			<header className="flex h-status-bar shrink-0 items-stretch justify-between border-b border-border bg-status">
				<StatusGroup items={leftItems} side="left" />
				<StatusGroup items={rightItems} side="right" />
			</header>
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
		</>
	);
}

function getNavigationLinkClassName(variant: StatusVariant): string {
	if (variant === "primary") {
		return "rounded px-1.5 text-status-primary-foreground/75 transition-colors hover:bg-status-primary-foreground/15 hover:text-status-primary-foreground";
	}

	return "rounded px-1.5 text-status-muted-foreground/75 transition-colors hover:bg-status-muted-foreground/15 hover:text-status-muted-foreground";
}

function getNavigationActiveLinkClassName(variant: StatusVariant): string {
	if (variant === "primary") {
		return "bg-status-primary-foreground/20 text-status-primary-foreground";
	}

	return "bg-status-muted-foreground/20 text-status-muted-foreground";
}

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
				"flex min-w-0 items-stretch",
				variant.foreground,
				props.side === "left" && !props.isFirst && "-ms-2.5",
				props.side === "right" && !props.isLast && "-me-2.5",
			)}
			style={{ zIndex: props.stack }}
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
