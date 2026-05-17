import type { ReactNode } from "react";
import { SourceLinks } from "#/portfolio/SourceLinks";
import { sectionMetadata } from "#/terminal/section-metadata";

const meta = sectionMetadata["/terminal/contact"];

export function ContactSection(): ReactNode {
	return (
		<div className="flex flex-1 flex-col gap-3 p-4 text-xs">
			<div className="text-muted-foreground">{"/* contacts */"}</div>
			<div className="flex flex-col gap-2">
				<div className="flex gap-4">
					<span className="text-primary">twitter</span>
					<span>@kirdesmf</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">email</span>
					<span>cedric@kirdes.dev</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">github</span>
					<span>github.com/kirdesmf</span>
				</div>
				<div className="flex gap-4">
					<span className="text-primary">linkedin</span>
					<span>linkedin.com/in/kirdesmf</span>
				</div>
			</div>
			<p className="text-muted-foreground">
				see <span className="text-primary">cat links.json</span> for structured data, or{" "}
				<span className="text-primary">contact.md</span> for more info.
			</p>
			{meta ? <SourceLinks meta={meta} /> : null}
		</div>
	);
}
