import { Link } from "@tanstack/react-router";
import { terminalNavigationItems } from "./terminal-routes";

function formatRouteLabel(label: string): string {
	if (label === "~") return "~/";

	return `${label}/`;
}

export function TerminalRouteList() {
	return (
		<div className="flex flex-wrap gap-x-4 gap-y-1">
			{terminalNavigationItems.map(({ command, label, to }) => (
				<Link
					activeOptions={{ exact: true }}
					activeProps={{ className: "text-primary" }}
					className="text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
					key={command}
					to={to}
				>
					{formatRouteLabel(label)}
				</Link>
			))}
		</div>
	);
}
