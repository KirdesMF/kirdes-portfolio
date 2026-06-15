import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { contactInfo } from "#/contact/contact-info";
import { copyToClipboard } from "#/design-system/clipboard";
import { Separator } from "#/design-system/separator";
import { m } from "#/paraglide/messages";

const labelClass = "inline-block w-24 shrink-0 text-muted-foreground/60";

export function InfosOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-foreground/90">
			<p className="font-thin text-muted-foreground/70 uppercase tracking-wider mt-4">
				{m.infos_title()}
			</p>
			<Separator className="mt-1 mb-2 opacity-50" />
			<div className="flex flex-col gap-0.5">
				<div>
					<span className={labelClass}>{m.infos_location_label()}</span>
					<span>{m.infos_location_value()}</span>
				</div>
				<div>
					<span className={labelClass}>{m.infos_focus_label()}</span>
					<span>{m.infos_focus_value()}</span>
				</div>
				<div>
					<span className={labelClass}>{m.infos_contact_label()}</span>
					<button
						className="underline-offset-2 hover:text-primary hover:underline"
						type="button"
						onClick={() => {
							void copyToClipboard(contactInfo.email);
						}}
					>
						{contactInfo.email}
					</button>
					<span> / </span>
					<a
						href={contactInfo.github.url}
						className="underline-offset-2 hover:text-primary hover:underline"
						target="_blank"
						rel="noreferrer"
					>
						github.com/{contactInfo.github.handle}
					</a>
				</div>
				<div>
					<span className={labelClass}>{m.infos_status_label()}</span>
					<span>{m.infos_status_value()}</span>
				</div>
			</div>
		</div>
	);
}

export function WhoamiOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap text-foreground/90">
			<p className="font-thin text-muted-foreground/70 uppercase tracking-wider mt-4">
				{m.whoami_title()}
			</p>
			<Separator className="mt-1 mb-2 opacity-50" />
			<div className="flex flex-col gap-0.5">
				<p>Cédric Gourville</p>
				<p className="text-muted-foreground">{m.whoami_role()}</p>
				<p className="mt-1 text-muted-foreground/70">
					{m.whoami_visit()}{" "}
					<Link className="text-primary underline-offset-2 hover:underline" to="/about">
						/about
					</Link>
				</p>
			</div>
		</div>
	);
}

export function EmailOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>{contactInfo.email}</p>
			<p className="text-muted-foreground">{m.email_copy_requested()}</p>
		</div>
	);
}
