import { createFileRoute } from "@tanstack/react-router";

type SkillEntry = {
	name: string;
	level: string;
};

const skillEntries: Array<SkillEntry> = [
	{ name: "typescript", level: "advanced" },
	{ name: "react", level: "advanced" },
	{ name: "tanstack", level: "advanced" },
	{ name: "design systems", level: "strong" },
];

export const Route = createFileRoute("/terminal/skill")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── skills ──</div>
			<div className="flex flex-col gap-2">
				{skillEntries.map(({ level, name }) => (
					<div className="flex gap-4" key={name}>
						<span className="text-primary">{name}</span>
						<span className="text-muted-foreground">{level}</span>
					</div>
				))}
			</div>
		</div>
	);
}
