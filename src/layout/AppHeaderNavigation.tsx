import { Link } from "@tanstack/react-router";
import { Code2 } from "lucide-react";
import { terminalNavigationItems } from "#/terminal/terminal-routes";

export function AppHeaderNavigation() {
	return (
		<nav aria-label="App sections" className="flex min-w-0 items-center overflow-x-auto">
			<div className="flex items-center gap-1 whitespace-nowrap">
				<Link
					activeOptions={{ includeSearch: true }}
					activeProps={{ className: "border-primary/40 bg-primary/10 text-primary" }}
					aria-label="Open editor"
					className="rounded border border-transparent px-1.5 py-0.5 text-tiny text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
					search={(previous) => ({
						file: previous.file,
						files: previous.files ?? [],
						panel: "editor",
					})}
					to="."
				>
					<Code2 className="size-3" />
				</Link>
				{terminalNavigationItems.map(({ command, label, to }) => (
					<Link
						activeOptions={{ exact: true }}
						activeProps={{
							className: "border-primary/40 bg-primary/10 text-primary",
						}}
						className="rounded border border-transparent px-1.5 py-0.5 text-tiny text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
						key={command}
						search={(previous) => ({
							file: previous.file,
							files: previous.files ?? [],
							panel: "route",
						})}
						to={to}
					>
						{label === "~" ? label : `/${label}`}
					</Link>
				))}
			</div>
		</nav>
	);
}
