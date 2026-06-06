import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { animate, createScope } from "animejs";
import { ClockIcon, FileTerminal, SettingsIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "#/design-system/cn";
import { Drawer, DrawerContent, DrawerHandle, DrawerTrigger } from "#/design-system/drawer";
import { useIsMobile } from "#/design-system/useMediaQuery";
import { Clock } from "#/layout/Clock";
import { m } from "#/paraglide/messages";
import { getLocale, setLocale } from "#/paraglide/runtime";
import { SettingsDialog } from "#/settings-dialog";
import { terminalNavigationItems } from "#/terminal/terminal-routes";
import {
	openEditorPanelSearch,
	setDialogSearch,
	showRoutePanelSearch,
} from "#/terminal/terminal-search-transitions";

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
	const [navDrawerOpen, setNavDrawerOpen] = useState(false);
	const isMobile = useIsMobile();

	function setSettingsOpen(open: boolean) {
		// biome-ignore lint/suspicious/noExplicitAny: route search is shared across nested terminal routes.
		void (navigate as any)({
			search: (previous: Record<string, unknown>) =>
				setDialogSearch(previous, open ? "settings" : undefined),
		});
	}

	// ── Desktop left items (current behavior) ──────────────────────────
	const desktopLeftItems: StatusItem[] = terminalNavigationItems.map(
		({ command, label, to }, index) => {
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
						search={showRoutePanelSearch}
						to={to}
					>
						{label === "~" ? label : `${label}/`}
					</Link>
				),
			};
		},
	);
	const editorVariant: StatusVariant = desktopLeftItems.length % 2 === 0 ? "primary" : "muted";

	// ── Mobile left items: menu + editor ───────────────────────────────
	const mobileMenuVariant: StatusVariant = "primary";
	const mobileEditorVariant: StatusVariant = "muted";

	const mobileLeftItems: StatusItem[] = [
		{
			id: "menu",
			variant: mobileMenuVariant,
			content: (
				<DrawerTrigger className="cursor-pointer" aria-label="Open navigation menu">
					menu
				</DrawerTrigger>
			),
		},
		{
			id: "editor",
			variant: mobileEditorVariant,
			content: (
				<Link
					activeOptions={{ includeSearch: true }}
					activeProps={{ className: getNavigationActiveLinkClassName(mobileEditorVariant) }}
					aria-label={m.header_open_editor()}
					className={getNavigationLinkClassName(mobileEditorVariant)}
					search={openEditorPanelSearch}
					to="."
				>
					<span className="flex items-center gap-1">
						<FileTerminal className="size-3" />
						<span className="sr-only">{m.header_editor_sr()}</span>
					</span>
				</Link>
			),
		},
	];

	// Desktop: add editor after nav items
	desktopLeftItems.push({
		id: "editor",
		variant: editorVariant,
		content: (
			<Link
				activeOptions={{ includeSearch: true }}
				activeProps={{ className: getNavigationActiveLinkClassName(editorVariant) }}
				aria-label={m.header_open_editor()}
				className={getNavigationLinkClassName(editorVariant)}
				search={openEditorPanelSearch}
				to="."
			>
				<span className="flex items-center gap-1">
					<FileTerminal className="size-3" />
					<span className="sr-only">{m.header_editor_sr()}</span>
				</span>
			</Link>
		),
	});
	const currentLocale = getLocale();
	const langShineRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = langShineRef.current;
		if (!el) return;
		// re-run when locale changes to attach shimmer to the new active button
		void currentLocale;

		const scope = createScope({
			mediaQueries: {
				reduceMotion: "(prefers-reduced-motion)",
			},
		}).add((self) => {
			const reduceMotion = self?.matches.reduceMotion ?? false;

			animate(el, {
				backgroundPosition: ["200%", "-200%"],
				duration: reduceMotion ? 0 : 4000,
				ease: "linear",
				loop: true,
			});
		});

		return () => {
			scope.revert();
		};
	}, [currentLocale]);

	const rightItems: StatusItem[] = [
		{
			id: "language",
			variant: "muted",
			content: (
				<div className="flex items-center gap-1.5">
					<button className="cursor-pointer" type="button" onClick={() => setLocale("fr")}>
						{currentLocale === "fr" ? (
							<span
								className="inline-block bg-linear-to-r from-status-open from-35% via-status-shimmer via-60% to-status-open to-55% bg-size-[200%_100%] bg-clip-text leading-none text-transparent"
								ref={currentLocale === "fr" ? langShineRef : undefined}
							>
								FR
							</span>
						) : (
							"FR"
						)}
					</button>
					<span>|</span>
					<button className="cursor-pointer" type="button" onClick={() => setLocale("en")}>
						{currentLocale === "en" ? (
							<span
								className="inline-block bg-linear-to-r from-status-open from-35% via-status-shimmer via-60% to-status-open to-55% bg-size-[200%_100%] bg-clip-text leading-none text-transparent"
								ref={currentLocale === "en" ? langShineRef : undefined}
							>
								EN
							</span>
						) : (
							"EN"
						)}
					</button>
				</div>
			),
		},
		{
			id: "settings",
			variant: "primary",
			content: (
				<button
					aria-label={m.header_open_settings()}
					className="inline-flex size-4 cursor-pointer items-center justify-center rounded-sm opacity-80 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
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
			<header className="flex h-status-bar shrink-0 items-stretch justify-between border-b border-border bg-status text-status-foreground">
				{/* Desktop navigation — inline chevron segments */}
				<div className="hidden min-w-0 md:flex">
					<StatusGroup items={desktopLeftItems} side="left" />
				</div>
				{/* Mobile navigation — menu chevron + editor */}
				{isMobile && (
					<Drawer open={navDrawerOpen} onOpenChange={setNavDrawerOpen}>
						<div className="flex min-w-0">
							<StatusGroup items={mobileLeftItems} side="left" />
						</div>
						<DrawerContent>
							<DrawerHandle />
							<div
								className={cn(
									"relative mx-4 mb-4 flex flex-col rounded border-2 border-border border-glow",
									"bg-popover text-popover-foreground overflow-hidden",
								)}
							>
								<MobileNavDrawer onNavigate={() => setNavDrawerOpen(false)} />
							</div>
						</DrawerContent>
					</Drawer>
				)}
				<StatusGroup items={rightItems} side="right" />
			</header>
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
		</>
	);
}

function getNavigationLinkClassName(variant: StatusVariant): string {
	if (variant === "primary") {
		return "rounded px-1.5 text-status-primary-foreground/75 transition-none";
	}

	return "rounded px-1.5 text-status-muted-foreground/75 transition-none";
}

function getNavigationActiveLinkClassName(variant: StatusVariant): string {
	if (variant === "primary") {
		return "text-status-primary-foreground";
	}

	return "text-status-muted-foreground";
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

function MobileNavDrawer({ onNavigate }: { onNavigate: () => void }) {
	return (
		<nav className="grid gap-2.5 p-2.5">
			{terminalNavigationItems.map(({ command, label, to }, index) => {
				const variant: StatusVariant = index % 2 === 0 ? "primary" : "muted";
				const direction = index % 2 === 0 ? "right" : "left";
				const v = variantClass[variant];

				return (
					<Link
						className={cn("flex h-10 min-w-0 items-stretch no-underline", v.foreground)}
						key={command}
						search={showRoutePanelSearch}
						to={to}
						onClick={onNavigate}
					>
						{direction === "left" && <Chevron direction="left" variant={variant} />}
						<div
							className={cn(
								"flex min-w-0 flex-1 items-center gap-2 px-4",
								v.background,
								direction === "left" ? "ps-5" : "pe-4",
							)}
						>
							<span className="text-sm uppercase tracking-wider">
								{label === "~" ? "terminal" : label}
							</span>
						</div>
						{direction === "right" && <Chevron direction="right" variant={variant} />}
					</Link>
				);
			})}
		</nav>
	);
}
