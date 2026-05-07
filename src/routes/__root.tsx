import { createRootRoute, HeadContent, ScriptOnce, Scripts } from "@tanstack/react-router";
import { Folder } from "lucide-react";
import type { ReactNode } from "react";
import { Separator } from "#/design-system/Separator";
import { Time } from "#/terminal/Time";
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
			{ title: "kirdes — portfolio" },
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
			<body className="isolate h-dvh overflow-hidden bg-background font-mono text-foreground">
				<ThemeProvider initialTheme={initialTheme}>
					<div className="flex h-dvh flex-col">
						<header className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
							<div className="flex items-center gap-2 text-sm">
								<Folder className="size-3.5 text-primary" />
								<span className="font-medium text-foreground">~</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-tiny text-muted-foreground">FR | EN</span>
								<Separator orientation="vertical" />
								<Time />
								<Separator orientation="vertical" />
								<ThemeToggle />
							</div>
						</header>
						<main className="flex min-h-0 flex-1">{children}</main>
					</div>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
