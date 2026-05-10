import type { ReactNode } from "react";
import { TerminalRouteList } from "./TerminalRouteList";
import { terminalRoutes } from "./terminal-routes";

export function HelpOutput(): ReactNode {
	return (
		<div>
			<p>available routes: {terminalRoutes.join(" ")}</p>
			<p>commands: cat cd clear close help ls music open reload whoami</p>
		</div>
	);
}

export function WelcomeOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>Welcome to kirdes terminal.</p>
			<p className="text-muted-foreground">Type help to list available commands.</p>
		</div>
	);
}

export function WhoamiOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>kirdes</p>
			<p className="text-muted-foreground">product engineer / interface builder</p>
			<p className="mt-1 text-muted-foreground/70">for more, visit /about</p>
		</div>
	);
}

export function RoutesOutput(): ReactNode {
	return <TerminalRouteList />;
}
