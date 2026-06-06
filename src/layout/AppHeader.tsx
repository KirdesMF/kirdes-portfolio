import { Link, useNavigate, useRouterState, useSearch } from "@tanstack/react-router";
import { animate, createScope } from "animejs";
import { ClockIcon, SettingsIcon } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "#/design-system/cn";
import { Drawer, DrawerContent, DrawerHandle, DrawerTrigger } from "#/design-system/drawer";
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

const activeLanguageClassName =
	"inline-block bg-linear-to-r from-status-open from-35% via-status-shimmer via-60% to-status-open to-55% bg-size-[200%_100%] bg-clip-text leading-none text-transparent";

export function AppHeader() {
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const search = useSearch({ from: "/terminal" });
	const settingsOpen = search.dialog === "settings";

	function setSettingsOpen(open: boolean) {
		void navigate({
			to: pathname,
			search: (previous) => setDialogSearch(previous, open ? "settings" : undefined),
		});
	}

	return (
		<>
			<header className="flex h-status-bar shrink-0 items-stretch justify-between border-b border-border bg-status text-status-foreground">
				<DesktopHeaderNav />
				<MobileHeaderNav />
				<HeaderActions onOpenSettings={() => setSettingsOpen(true)} />
			</header>
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
		</>
	);
}

function DesktopHeaderNav() {
	const navigationItems = createDesktopNavigationItems();
	const editorVariant: StatusVariant = navigationItems.length % 2 === 0 ? "primary" : "muted";
	const items = [
		...navigationItems,
		createEditorStatusItem({ id: "editor", variant: editorVariant }),
	];

	return (
		<div className="hidden min-w-0 md:flex">
			<StatusGroup items={items} side="left" />
		</div>
	);
}

function MobileHeaderNav() {
	const [open, setOpen] = useState(false);
	const items: StatusItem[] = [
		{
			id: "menu",
			variant: "primary",
			content: (
				<DrawerTrigger className="cursor-pointer" aria-label="Open navigation menu">
					menu
				</DrawerTrigger>
			),
		},
		createEditorStatusItem({ id: "editor", variant: "muted" }),
	];

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<div className="flex min-w-0 md:hidden">
				<StatusGroup items={items} side="left" />
			</div>
			<DrawerContent>
				<DrawerHandle />
				<div
					className={cn(
						"relative mx-4 mb-4 flex flex-col rounded border-2 border-border border-glow",
						"bg-popover text-popover-foreground overflow-hidden",
					)}
				>
					<MobileNavDrawer onNavigate={() => setOpen(false)} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function HeaderActions({ onOpenSettings }: { onOpenSettings: () => void }) {
	const items: StatusItem[] = [
		{
			id: "language",
			variant: "muted",
			content: <LanguageSwitcher />,
		},
		{
			id: "settings",
			variant: "primary",
			content: (
				<button
					aria-label={m.header_open_settings()}
					className="inline-flex size-4 cursor-pointer items-center justify-center rounded-sm opacity-80 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
					type="button"
					onClick={onOpenSettings}
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

	return <StatusGroup items={items} side="right" />;
}

function LanguageSwitcher() {
	const currentLocale = getLocale();

	return (
		<div className="flex items-center gap-1.5">
			<LanguageButton active={currentLocale === "fr"} label="FR" locale="fr" />
			<span>|</span>
			<LanguageButton active={currentLocale === "en"} label="EN" locale="en" />
		</div>
	);
}

function LanguageButton({
	active,
	label,
	locale,
}: {
	active: boolean;
	label: string;
	locale: "en" | "fr";
}) {
	return (
		<button className="cursor-pointer" type="button" onClick={() => setLocale(locale)}>
			{active ? <ActiveLanguageLabel label={label} /> : label}
		</button>
	);
}

function ActiveLanguageLabel({ label }: { label: string }) {
	const labelRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = labelRef.current;
		if (!el) return;

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
	}, []);

	return (
		<span className={activeLanguageClassName} ref={labelRef}>
			{label}
		</span>
	);
}

function createDesktopNavigationItems(): Array<StatusItem> {
	return terminalNavigationItems.map(({ command, label, to }, index) => {
		const variant: StatusVariant = index % 2 === 0 ? "primary" : "muted";

		return {
			id: command,
			variant,
			content: (
				<Link
					activeOptions={{ exact: true }}
					activeProps={{ className: getNavigationActiveLinkClassName(variant) }}
					className={getNavigationLinkClassName(variant)}
					search={showRoutePanelSearch}
					to={to}
				>
					{label === "~" ? label : `${label}/`}
				</Link>
			),
		};
	});
}

function createEditorStatusItem({
	id,
	variant,
}: {
	id: string;
	variant: StatusVariant;
}): StatusItem {
	return {
		id,
		variant,
		content: (
			<Link
				activeOptions={{ includeSearch: true }}
				activeProps={{ className: getNavigationActiveLinkClassName(variant) }}
				aria-label={m.header_open_editor()}
				className={getNavigationLinkClassName(variant)}
				search={openEditorPanelSearch}
				to="."
			>
				editor
			</Link>
		),
	};
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
