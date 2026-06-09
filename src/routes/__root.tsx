import { createRootRoute, HeadContent, Outlet, ScriptOnce, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster, ToastProvider } from "#/design-system/toast";
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
		links: [{ rel: "stylesheet", href: appCss }],
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
			<body className="h-dvh overflow-hidden bg-background font-mono font-extralight text-xs text-foreground before:scanlines">
				<div className="relative isolate h-full">
					<ThemeProvider initialAppearance={initialAppearance}>
						<ToastProvider>
							{children}
							<Toaster />
						</ToastProvider>
					</ThemeProvider>
				</div>
				<Scripts />
			</body>
		</html>
	);
}
