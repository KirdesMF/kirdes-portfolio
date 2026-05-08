import { Link } from "@tanstack/react-router";
import { terminalNavigationItems } from "#/terminal/terminal-routes";

export function AppHeaderNavigation() {
	return (
		<nav aria-label="App sections" className="flex min-w-0 items-center overflow-x-auto">
			<div className="flex items-center gap-1 whitespace-nowrap">
				{terminalNavigationItems.map(({ command, label, to }) => (
					<Link
						activeOptions={{ exact: true }}
						activeProps={{
							className: "border-primary/40 bg-primary/10 text-primary",
						}}
						className="rounded border border-transparent px-1.5 py-0.5 text-tiny text-muted-foreground transition-colors hover:border-border hover:bg-muted/40 hover:text-foreground"
						key={command}
						search={(previous) => ({ file: previous.file, panel: "route" })}
						to={to}
					>
						{label === "~" ? label : `/${label}`}
					</Link>
				))}
			</div>
		</nav>
	);
}
