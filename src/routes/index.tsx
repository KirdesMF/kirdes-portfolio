import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({
			params: { projectId: "welcome", workspaceId: "1" },
			to: "/editor/$workspaceId/$projectId",
			search: {
				left: "closed",
				open: ["welcome"],
				right: "closed",
				selected: { "1": "welcome" },
				terminal: "closed",
			},
		});
	},
});
