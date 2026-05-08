import { useRouterState } from "@tanstack/react-router";

function formatWorkingDirectory(pathname: string): string {
	if (pathname === "/terminal") return "~/";
	if (!pathname.startsWith("/terminal/")) return "~/";

	return `~/${pathname.replace("/terminal/", "")}`;
}

export function TerminalSessionHeader() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const workingDirectory = formatWorkingDirectory(pathname);

	return (
		<div className="flex h-7 shrink-0 items-center justify-between border-b border-border px-3 text-tiny text-muted-foreground">
			<div className="flex min-w-0 items-center gap-2">
				<span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
				<span className="shrink-0 text-foreground">portfolio-os v0.1.0</span>
				<span className="hidden text-muted-foreground/50 sm:inline">·</span>
				<span className="hidden shrink-0 text-primary sm:inline">access granted</span>
				<span className="hidden text-muted-foreground/50 md:inline">·</span>
				<span className="hidden shrink-0 md:inline">status: online</span>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<span className="text-muted-foreground/50">cwd</span>
				<span className="text-primary">{workingDirectory}</span>
			</div>
		</div>
	);
}
