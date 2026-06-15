import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LanguageSwitcher } from "#/ide/language-switcher";
import { useIdeStore } from "#/ide/store";

export function AppHeader() {
	const toggleCommandMenu = useIdeStore((s) => s.toggleCommandMenu);
	const setSettingsOpen = useIdeStore((s) => s.setSettingsOpen);
	const setHelpOpen = useIdeStore((s) => s.setHelpOpen);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	function toggleExplorer() {
		void navigate({
			to: pathname,
			search: (prev) => ({
				...prev,
				neotree: prev.neotree === "open" ? undefined : "open",
			}),
		});
	}

	return (
		<header className="flex h-status-bar shrink-0 items-center justify-between border-b border-border bg-background px-3 text-tiny text-muted-foreground">
			{/* Left: menu */}
			<div className="flex items-center gap-3">
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
				<button
					className="cursor-pointer text-muted-foreground/70 transition hover:text-foreground"
					type="button"
					onClick={() => setHelpOpen(true)}
				>
					[help]
				</button>
			</div>

			{/* Right: settings, language */}
			<div className="flex items-center gap-3">
				<button
					className="cursor-pointer text-muted-foreground/70 transition hover:text-foreground"
					type="button"
					onClick={() => setSettingsOpen(true)}
				>
					[settings]
				</button>
				<LanguageSwitcher />
			</div>
		</header>
	);
}
