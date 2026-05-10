import { createFileRoute } from "@tanstack/react-router";

type ProjectEntry = {
	name: string;
	stack: string;
	status: string;
};

const projectEntries: Array<ProjectEntry> = [
	{ name: "kirdes portfolio", stack: "tanstack start, react, tailwind", status: "live" },
	{ name: "pi skills", stack: "typescript, tooling", status: "active" },
	{ name: "ui kit", stack: "design system, tokens", status: "in progress" },
];

export const Route = createFileRoute("/terminal/projects")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── projects ──</div>
			<div className="flex flex-col gap-2">
				{projectEntries.map(({ name, stack, status }) => (
					<div className="flex gap-4" key={name}>
						<span className="text-primary">{name}</span>
						<span>{stack}</span>
						<span className="text-muted-foreground">{status}</span>
					</div>
				))}
			</div>
			<p className="text-muted-foreground">
				see <span className="text-primary">cat README.md</span> for details,
				or open the <span className="text-primary">.json</span> files for each project.
			</p>
		</div>
	);
}
