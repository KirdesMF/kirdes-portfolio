import { Link, useRouterState } from "@tanstack/react-router";
import { Maximize2, Minimize2, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";
import { Separator } from "#/design-system/Separator";

function formatRouteLabel(pathname: string): string {
	if (pathname === "/terminal") return "~/";
	if (!pathname.startsWith("/terminal/")) return "~/";

	return `~/${pathname.replace("/terminal/", "")}`;
}

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
	const routeLabel = formatRouteLabel(pathname);

	return (
		<div className={cn("flex min-h-0 w-full flex-1 flex-col overflow-hidden", className)}>
			<div className="flex h-status-bar shrink-0 items-center border-b border-border bg-background/60">
				<span className="px-3 text-tiny text-muted-foreground/70">{routeLabel}</span>
				<div className="flex-1 h-full bg-stripes border-x-accent border-x"></div>
				<button
					aria-label={isMaximized ? "Minimize panel" : "Maximize panel"}
					className="ms-auto flex h-full shrink-0 items-center px-2 text-tiny text-muted-foreground/70 hover:text-foreground"
					type="button"
					onClick={onToggleMaximize}
				>
					{isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
				</button>
				<Separator className="h-full" orientation="vertical" />
				<Link
					aria-label="Close panel"
					className="flex h-full shrink-0 items-center px-3 text-tiny text-muted-foreground/70 hover:text-foreground"
					search={(prev) => ({
						...prev,
						activeFile: prev.activeFile,
						editor: prev.editor,
						files: prev.files ?? [],
						panel: "terminal",
					})}
					to="/terminal"
				>
					<X className="size-3.5" />
				</Link>
			</div>
			<div
				className={cn(
					"min-h-0 flex-1 overflow-y-auto p-3",
					hasEditorPanel && "md:border-b md:border-border",
				)}
			>
				{children}
			</div>
		</div>
	);
}
