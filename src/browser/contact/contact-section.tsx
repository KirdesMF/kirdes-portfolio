import type { ReactNode } from "react";
import { SourceLinks } from "#/browser/source-links";
import { m } from "#/paraglide/messages";
import { workspaceViewMetadata } from "#/workspace/workspace-catalogue";

const meta = workspaceViewMetadata["/terminal/contact"];

export function ContactSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{m.contact_comment()}</div>
			<div className="flex flex-col gap-2">
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_twitter_label()}</span>
					<span>@kirdesmf</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_email_label()}</span>
					<span>cedric@kirdes.dev</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_github_label()}</span>
					<span>github.com/kirdesmf</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_linkedin_label()}</span>
					<span>linkedin.com/in/kirdesmf</span>
				</div>
			</div>
			<p className="text-muted-foreground">{m.contact_guidance()}</p>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}
