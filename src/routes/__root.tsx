import { createRootRoute, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { getLocale } from "#/paraglide/runtime";
import { getInitialAppearanceSettings } from "#/theme/theme.functions";
import {
	defaultResolvedMode,
	resolveAppearanceMode,
	resolveThemeForMode,
} from "#/theme/theme.types";
import { themeBootScript } from "#/theme/theme-boot-script";
import { ThemeProvider } from "#/theme/theme-provider";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	loader: () => getInitialAppearanceSettings(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "kirdes — portfolio" },
		],
		links: [
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{ rel: "stylesheet", href: appCss },
		],
	}),
	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return <Outlet />;
}

function RootDocument({ children }: { children: ReactNode }) {
	const initialAppearance = Route.useLoaderData();
	const serverResolvedMode = resolveAppearanceMode(
		initialAppearance.mode,
		defaultResolvedMode === "dark",
	);
	const serverTheme = resolveThemeForMode(initialAppearance, serverResolvedMode);

	return (
		<html
			lang={getLocale()}
			className={serverResolvedMode}
			data-mode={initialAppearance.mode}
			data-theme={serverTheme}
			style={{ colorScheme: serverResolvedMode }}
			suppressHydrationWarning
		>
			<head>
				<HeadContent />
				<ScriptOnce>{themeBootScript}</ScriptOnce>
			</head>
			<body className="h-dvh overflow-hidden bg-background font-mono font-extralight text-xs text-foreground">
				<svg
					aria-hidden="true"
					className="pointer-events-none fixed inset-0 z-screen-effect size-full opacity-80 mix-blend-screen grayscale dark:opacity-20"
				>
					<filter id="noise-bg-fx">
						<feTurbulence baseFrequency="0.8" />
					</filter>
					<rect width="100%" height="100%" filter="url(#noise-bg-fx)" />
				</svg>
				<div className="relative isolate h-full">
					<ThemeProvider initialAppearance={initialAppearance}>{children}</ThemeProvider>
				</div>
				<Scripts />
			</body>
		</html>
	);
}
