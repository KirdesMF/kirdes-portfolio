import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter, defaultParseSearch } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

function stringifySearch(search: Record<string, unknown>): string {
	const params = new URLSearchParams();

	Object.entries(search).forEach(([key, value]) => {
		if (value === undefined) return;
		if (value === null) return;
		if (Array.isArray(value)) {
			if (value.length === 0) return;
			params.set(key, value.join(","));
			return;
		}

		params.set(key, String(value));
	});

	const value = params.toString();
	if (value === "") return "";
	return `?${value}`;
}

export function getRouter() {
	const queryClient = new QueryClient();

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		parseSearch: defaultParseSearch,
		stringifySearch,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultNotFoundComponent: () => <div>Not Found</div>,
	});

	setupRouterSsrQueryIntegration({ router, queryClient });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
