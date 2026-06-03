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
							className: "bg-status-primary-foreground/20 text-status-primary-foreground",
						}}
						className="rounded px-1.5 py-0.5 text-status-primary-foreground/75 transition-colors hover:bg-status-primary-foreground/15 hover:text-status-primary-foreground"
						key={command}
						search={(previous) => ({
							activeFile: previous.activeFile,
							editor: previous.editor,
							files: previous.files ?? [],
							panel: "route",
						})}
						to={to}
					>
						{label === "~" ? label : `${label}/`}
					</Link>
				))}
			</div>
		</nav>
	);
}
