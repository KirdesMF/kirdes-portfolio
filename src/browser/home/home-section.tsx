import type { ReactNode } from "react";
import { SourceLinks } from "#/browser/source-links";
import { Separator } from "#/design-system/separator";
import { m } from "#/paraglide/messages";
import { workspaceViewMetadata } from "#/workspace/workspace-catalogue";

const meta = workspaceViewMetadata["/terminal/start"];

export function HomeSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{m.welcome_title()}</div>
			<Separator className="opacity-50" />
			<div className="flex flex-col gap-1 text-muted-foreground">
				<p>{m.welcome_message()}</p>
				<p className="mt-2">
					{m.welcome_hint_prefix()} <span className="text-foreground">help</span>{" "}
					{m.welcome_hint_suffix()}
				</p>
			</div>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}
