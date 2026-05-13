import type { ReactNode } from "react";

const quickLinks = [
	{ label: "/about", desc: "who i am" },
	{ label: "/work", desc: "what i've done" },
	{ label: "/contact", desc: "get in touch" },
] as const;

export function HomePage(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">── home ──</div>
			<div className="flex flex-col gap-1 text-muted-foreground">
				<p>kirdes terminal portfolio</p>
				<p className="mt-2">
					type <span className="text-primary">help</span> for available commands.
				</p>
				<div className="mt-3 flex flex-col gap-1">
					{quickLinks.map(({ label, desc }) => (
						<div className="flex gap-4" key={label}>
							<span className="text-primary">{label}</span>
							<span className="text-muted-foreground">{desc}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
