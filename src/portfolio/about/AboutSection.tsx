import type { ReactNode } from "react";
import { SourceLinks } from "#/portfolio/SourceLinks";
import { workspaceViewMetadata } from "#/workspace/workspace-catalogue";

const meta = workspaceViewMetadata["/terminal/about"];

export function AboutSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{"/* about */"}</div>
			<div className="flex flex-col gap-1 text-muted-foreground">
				<p>product engineer / interface builder</p>
				<p className="mt-2">
					see <span className="text-primary">cat README.md</span> for details,
					<span className="text-primary"> skills.json</span> for skills, and{" "}
					<span className="text-primary">values.md</span> for principles.
				</p>
			</div>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}
