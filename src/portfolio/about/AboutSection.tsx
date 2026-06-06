import type { ReactNode } from "react";
import { m } from "#/paraglide/messages";
import { SourceLinks } from "#/portfolio/SourceLinks";
import { workspaceViewMetadata } from "#/workspace/workspace-catalogue";

const meta = workspaceViewMetadata["/terminal/about"];

export function AboutSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{m.about_comment()}</div>
			<div className="flex flex-col gap-1 text-muted-foreground">
				<p>{m.about_role()}</p>
				<p className="mt-2">
					{m.about_guidance()}
				</p>
			</div>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}
