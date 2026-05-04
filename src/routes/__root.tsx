import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, ScriptOnce, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";
import { ThemeProvider } from "#/theme/ThemeProvider";
import { ThemeToggle } from "#/theme/ThemeToggle";
import { getInitialThemePreference } from "#/theme/theme.functions";
import { themeBootScript } from "#/theme/themeBootScript";
import { defaultResolvedTheme, resolveThemePreference } from "#/theme/themeTypes";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	loader: () => getInitialThemePreference(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "TanStack Start Starter" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
	const initialTheme = Route.useLoaderData();
	const serverResolvedTheme = resolveThemePreference(initialTheme, defaultResolvedTheme === "dark");

	return (
		<html
			lang="en"
			className={serverResolvedTheme}
			data-theme={initialTheme}
			style={{ colorScheme: serverResolvedTheme }}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
				<ScriptOnce>{themeBootScript}</ScriptOnce>
			</head>
			<body className="root isolate relative font-mono bg-background">
				<ThemeProvider initialTheme={initialTheme}>
					<header className="flex items-center justify-between border-b border-border px-6 py-4">
						<span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
							Kirdes Portfolio
						</span>
						<ThemeToggle />
					</header>
					{children}
				</ThemeProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
