import { useNavigate, useRouterState } from "@tanstack/react-router";
import { SettingsIcon } from "lucide-react";
import { cn } from "#/design-system/cn";
import { LanguageSwitcher } from "#/ide/language-switcher";
import { useIdeStore } from "#/ide/store";
import { m } from "#/paraglide/messages";

export function AppHeader() {
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	function toggleExplorer() {
		void navigate({
			to: pathname,
			search: (prev) => ({
				...prev,
				neotree: prev.neotree === "open" ? "closed" : "open",
			}),
		});
	}

	return (
		<header className="flex h-status-bar shrink-0 items-center justify-between border-b border-border bg-background px-3 text-tiny text-muted-foreground">
			{/* Left: traffic lights + menu */}
			<div className="flex items-center gap-3">
				<TrafficLights />
				<button
					className="cursor-pointer text-muted-foreground/70 transition hover:text-foreground"
					type="button"
					onClick={toggleCommandMenu}
				>
					[menu]
				</button>
				<button
					className="cursor-pointer text-muted-foreground/70 transition hover:text-foreground"
					type="button"
					onClick={toggleExplorer}
				>
					[explorer]
				</button>
			</div>

			{/* Right: language, settings */}
			<div className="flex items-center gap-3">
				<LanguageSwitcher />
				<button
					aria-label={m.header_open_settings()}
					className="inline-flex size-4 cursor-pointer items-center justify-center rounded-sm opacity-80 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring"
					type="button"
					onClick={() => setSettingsOpen(true)}
				>
					<SettingsIcon className="size-3" />
				</button>
			</div>
		</header>
	);
}

function TrafficLights() {
	return (
		<div className="flex items-center gap-1.5" aria-hidden="true">
			<div className={cn("size-3 rounded-full bg-red-500/80")} />
			<div className={cn("size-3 rounded-full bg-yellow-500/80")} />
			<div className={cn("size-3 rounded-full bg-green-500/80")} />
		</div>
	);
}
