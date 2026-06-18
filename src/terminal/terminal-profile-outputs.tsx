import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { contactInfo } from "#/data";
import { Separator } from "#/design-system/separator";
import { m } from "#/paraglide/messages";

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
