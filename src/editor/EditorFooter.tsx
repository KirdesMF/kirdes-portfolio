import { Link, useSearch } from "@tanstack/react-router";
import { Contact, Settings, Sparkles, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "#/design-system/cn";
import { Menu } from "#/design-system/Menu";
import { Popover } from "#/design-system/Popover";
import { Separator } from "#/design-system/Separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "#/design-system/Tooltip";
import { toggleTerminalSearch } from "#/editor/editor-search";

type AvailabilityStatus = "available" | "looking" | "unavailable";

const currentAvailabilityStatus = {
	label: "Available to work",
	value: "available",
} as const satisfies {
	label: string;
	value: AvailabilityStatus;
};

const statusDotClassNameByStatus = {
	available: "text-selected-folder-indicator",
	looking: "text-amber-500",
	unavailable: "text-destructive",
} as const satisfies Record<AvailabilityStatus, string>;

const contactLinks = [
	{ href: "#email", label: "Email" },
	{ href: "#calendar", label: "Book time" },
	{ href: "#linkedin", label: "LinkedIn" },
	{ href: "#github", label: "GitHub" },
] as const;

function formatTime(date: Date, timeZone?: string): string {
	return new Intl.DateTimeFormat(undefined, {
		hour: "2-digit",
		minute: "2-digit",
		timeZone,
	}).format(date);
}

function useCurrentDate(): Date | undefined {
	const [date, setDate] = useState<Date>();

	useEffect(() => {
		setDate(new Date());
		const interval = window.setInterval(() => setDate(new Date()), 60_000);

		return () => window.clearInterval(interval);
	}, []);

	return date;
}

export function EditorFooter(): React.ReactNode {
	const search = useSearch({ from: "/editor" });
	const isTerminalOpen = search.terminal === "open";
	const currentDate = useCurrentDate();
	const cedricTime = currentDate ? formatTime(currentDate, "Europe/Paris") : "--:--";
	const visitorTime = currentDate ? formatTime(currentDate) : "--:--";

	return (
		<footer className="flex h-8 items-center justify-between gap-1 border-t border-border px-2">
			<div className="flex items-center gap-1">
				<Tooltip>
					<TooltipTrigger
						render={
							<button
								aria-label="Open settings"
								className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
								type="button"
							>
								<Settings className="size-3.5" />
							</button>
						}
					/>
					<TooltipContent>Settings</TooltipContent>
				</Tooltip>
				<Separator orientation="vertical" />
				<Tooltip>
					<TooltipTrigger
						render={
							<button
								aria-label="Open AI agent panel"
								className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
								type="button"
							>
								<Sparkles className="size-3.5" />
							</button>
						}
					/>
					<TooltipContent>Open AI agent panel</TooltipContent>
				</Tooltip>
				<Separator orientation="vertical" />
				<Tooltip>
					<TooltipTrigger
						render={
							<Link
								aria-label={isTerminalOpen ? "Close terminal panel" : "Open terminal panel"}
								aria-pressed={isTerminalOpen}
								className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring data-[active=true]:text-primary"
								data-active={isTerminalOpen}
								from="/editor"
								search={toggleTerminalSearch}
							>
								<Terminal className="size-3.5" />
							</Link>
						}
					/>
					<TooltipContent>
						{isTerminalOpen ? "Close terminal panel" : "Open terminal panel"}
					</TooltipContent>
				</Tooltip>
			</div>
			<div className="flex min-w-0 items-center gap-1.5 text-muted-foreground text-xs">
				<div className="hidden items-center gap-2 sm:flex">
					<span>Cedric {cedricTime}</span>
					<span>You {visitorTime}</span>
				</div>
				<Separator orientation="vertical" />
				<Popover
					content={
						<div className="space-y-1">
							<p className="font-medium text-sm">{currentAvailabilityStatus.label}</p>
							<p className="text-muted-foreground text-xs">
								Fake status for now. I am open to focused frontend, design system, and product UI
								work.
							</p>
						</div>
					}
				>
					<button
						aria-label="Show availability details"
						className="flex items-center gap-1.5 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
						type="button"
					>
						<span
							className={cn(
								"size-1.5 animate-status-dot-pulse rounded-full bg-current motion-reduce:animate-none",
								statusDotClassNameByStatus[currentAvailabilityStatus.value],
							)}
						/>
						<span className="truncate">{currentAvailabilityStatus.label}</span>
					</button>
				</Popover>
				<Separator orientation="vertical" />
				<Menu items={contactLinks}>
					<button
						aria-label="Open contact menu"
						className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
						type="button"
					>
						<Contact className="size-3.5" />
					</button>
				</Menu>
			</div>
		</footer>
	);
}
