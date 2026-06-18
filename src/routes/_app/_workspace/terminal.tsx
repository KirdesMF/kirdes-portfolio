import { createFileRoute } from "@tanstack/react-router";
import { TerminalPane } from "#/terminal/terminal-pane";
import { useTerminalController } from "#/terminal/use-terminal-controller";
import { useTheme } from "#/theme/theme-provider";

export const Route = createFileRoute("/_app/_workspace/terminal")({
	component: TerminalRoute,
});

function TerminalRoute() {
	const { setAppearance, appearance } = useTheme();

	const { handleSubmit, history } = useTerminalController({
		currentRoute: "/terminal",
		setMode: (mode) => setAppearance({ ...appearance, mode }),
	});

	return <TerminalPane history={history} onSubmit={handleSubmit} />;
}
