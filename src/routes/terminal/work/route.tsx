import { createFileRoute } from "@tanstack/react-router";

type WorkEntry = {
	name: string;
	period: string;
	role: string;
};

const workEntries: Array<WorkEntry> = [
	{ name: "kirdes", period: "2023 → now", role: "freelance product engineer" },
	{ name: "indie", period: "2021 → now", role: "building tools and ui systems" },
];

export const Route = createFileRoute("/terminal/work")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── work ──</div>
			<div className="flex flex-col gap-2">
				{workEntries.map(({ name, period, role }) => (
					<div className="flex gap-4" key={name}>
						<span className="text-primary">{name}</span>
						<span>{period}</span>
						<span className="text-muted-foreground">{role}</span>
					</div>
				))}
			</div>
			<p className="text-muted-foreground">
				see <span className="text-primary">cat experience.json</span> for details and{" "}
				<span className="text-primary">freelance.md</span> for availability.
			</p>
		</div>
	);
}
