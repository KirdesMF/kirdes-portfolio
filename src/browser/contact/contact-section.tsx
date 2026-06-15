import type { ReactNode } from "react";
import { SourceLinks } from "#/browser/source-links";
import { contactInfo } from "#/contact/contact-info";
import { m } from "#/paraglide/messages";
import { workspaceViewMetadata } from "#/workspace/workspace-catalogue";

const meta = workspaceViewMetadata["/contact"];

export function ContactSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{m.contact_comment()}</div>
			<div className="flex flex-col gap-2">
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_twitter_label()}</span>
					<span>{contactInfo.x.handle}</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_email_label()}</span>
					<span>{contactInfo.email}</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_github_label()}</span>
					<span>github.com/{contactInfo.github.handle}</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">{m.contact_linkedin_label()}</span>
					<span>linkedin.com/in/{contactInfo.linkedin.handle}</span>
				</div>
			</div>
			<p className="text-muted-foreground">{m.contact_guidance()}</p>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}
