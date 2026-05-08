import { Link } from "@tanstack/react-router";
import { terminalFiles } from "./terminal-files";
import { terminalNavigationItems } from "./terminal-routes";

function formatRouteLabel(label: string): string {
	if (label === "~") return "~/";

	return `${label}/`;
}

export function TerminalRouteList() {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				<span className="w-10 text-muted-foreground/60">dirs</span>
				{terminalNavigationItems.map(({ command, label, to }) => (
					<Link
						activeOptions={{ exact: true }}
						activeProps={{ className: "text-primary" }}
						className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
						key={command}
						search={(previous) => ({
							file: previous.file,
							files: previous.files ?? [],
							panel: "route",
						})}
						to={to}
					>
						{formatRouteLabel(label)}
					</Link>
				))}
			</div>
			<div className="flex flex-wrap gap-x-4 gap-y-1">
				<span className="w-10 text-muted-foreground/60">files</span>
				{terminalFiles.map(({ name }) => (
					<Link
						className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
						key={name}
						search={(previous) => ({
							...previous,
							file: name,
							files: [...new Set([...(previous.files ?? []), name])],
							panel: "editor",
						})}
						to="."
					>
						{name}
					</Link>
				))}
			</div>
		</div>
	);
}
