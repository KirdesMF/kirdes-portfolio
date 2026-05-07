import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({
			params: { projectId: "welcome", workspaceId: "workspace-1" },
			to: "/editor/$workspaceId/$projectId",
			search: {
				left: "open",
				open: ["welcome"],
				right: "open",
				selected: { "workspace-1": "welcome" },
				terminal: "closed",
			},
		});
	},
});
