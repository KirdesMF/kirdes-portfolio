import { createRootRoute, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeProvider } from "#/theme/ThemeProvider";
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
			{ title: "kirdes — portfolio" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return <Outlet />;
}

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
			<body className="isolate h-dvh overflow-hidden bg-background font-mono text-foreground">
				<ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
