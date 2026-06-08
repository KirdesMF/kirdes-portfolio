import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TerminalPane } from "#/terminal/terminal-pane";
import { useTerminalController } from "#/terminal/use-terminal-controller";
import { useTheme } from "#/theme/theme-provider";

export const Route = createFileRoute("/_ide/terminal")({
	component: TerminalRoute,
});

function TerminalRoute() {
	const { setAppearance, appearance } = useTheme();
	const navigate = useNavigate();

	const { handleSubmit, history } = useTerminalController({
		currentRoute: "/terminal",
		setMode: (mode) => setAppearance({ ...appearance, mode }),
	});

	return (
		<section className="relative flex h-full w-full min-h-0 flex-col border-border text-xs">
			<div className="flex h-status-bar shrink-0 items-center justify-between border-b border-border bg-background/60 px-3 text-tiny text-muted-foreground">
				<span>terminal</span>
				<button
					aria-label="Close terminal"
					className="cursor-pointer text-muted-foreground/70 transition hover:text-foreground"
					type="button"
					onClick={() => navigate({ to: "/editor" })}
				>
					[close]
				</button>
			</div>
			<TerminalPane currentRoute="/terminal" history={history} onSubmit={handleSubmit} />
		</section>
	);
}
