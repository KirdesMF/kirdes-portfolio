import { Link, useRouterState } from "@tanstack/react-router";
import { EarthIcon, Maximize2, Minimize2, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { Separator } from "#/design-system/Separator";
import { getLocale } from "#/paraglide/runtime";
import { showTerminalPanelSearch } from "#/terminal/terminal-search-transitions";

export function TerminalRoutePane({
	children,
	className,
	hasEditorPanel,
	isMaximized,
	onToggleMaximize,
}: {
	children: ReactNode;
	className?: string;
	hasEditorPanel: boolean;
	isMaximized?: boolean;
	onToggleMaximize: () => void;
}) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const locale = getLocale();
	const urlPath = pathname === "/terminal" ? "/" : pathname.replace("/terminal", "");
	const displayUrl = `http://localhost:3000/${locale}${urlPath}`;
	return (
		<div className={cn("flex min-h-0 w-full flex-1 flex-col overflow-hidden", className)}>
			<div className="flex h-status-bar shrink-0 items-center border-b border-border bg-background/60">
				<div className="flex flex-1 items-center gap-2 self-stretch px-3">
					<EarthIcon className="size-3.5 shrink-0 text-muted-foreground/40" />
					<span className="text-tiny text-muted-foreground/60 truncate">{displayUrl}</span>
				</div>
				<Separator className="h-full" orientation="vertical" />
				<button
					aria-label={isMaximized ? "Minimize panel" : "Maximize panel"}
					className="flex h-full shrink-0 items-center px-2 text-tiny text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={onToggleMaximize}
				>
					{isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
				</button>
				<Separator className="h-full" orientation="vertical" />
				<Link
					aria-label="Close panel"
					className="flex h-full shrink-0 items-center px-2 text-tiny text-muted-foreground/70 hover:text-foreground"
					search={showTerminalPanelSearch}
					to="/terminal"
				>
					<X className="size-3.5" />
				</Link>
			</div>
			<div
				className={cn(
					"min-h-0 flex-1 overflow-y-auto p-3 scrollbar-gutter-both",
					hasEditorPanel && "md:border-b md:border-border",
				)}
			>
				{children}
			</div>
		</div>
	);
}
