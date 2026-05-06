import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({
			to: "/editor",
			search: {
				left: "closed",
				openProjects: [],
				right: "closed",
				terminal: "closed",
				workspace: "1",
			},
		});
	},
});
