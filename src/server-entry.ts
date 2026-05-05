import type { Register } from "@tanstack/react-router";
import type { RequestHandler } from "@tanstack/react-start/server";

type ServerEntry = { fetch: RequestHandler<Register> };

async function createFetchHandler(): Promise<ServerEntry["fetch"]> {
	const server = await import("@tanstack/react-start/server");
	return server.createStartHandler(server.defaultStreamHandler);
}

export default {
	async fetch(request: Request) {
		const fetchHandler = await createFetchHandler();
		return await fetchHandler(request);
	},
} satisfies ServerEntry;
