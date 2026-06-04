import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { copyToClipboard } from "#/design-system/clipboard";
import { Separator } from "#/design-system/Separator";
import { showRoutePanelSearch } from "#/terminal/terminal-search-transitions";

const labelClass = "inline-block w-24 shrink-0 text-muted-foreground/60";

export function InfosOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-foreground/90">
			<p className="font-thin text-muted-foreground/70 uppercase tracking-wider">[INFORMATIONS]</p>
			<Separator className="mt-1 mb-2 opacity-50" />
			<div className="flex flex-col gap-0.5">
				<div>
					<span className={labelClass}>LOCATION</span>
					<span>Paris, France</span>
				</div>
				<div>
					<span className={labelClass}>FOCUS</span>
					<span>frontend architecture — design systems — dev tooling</span>
				</div>
				<div>
					<span className={labelClass}>CONTACT</span>
					<button
						className="underline-offset-2 hover:text-primary hover:underline"
						type="button"
						onClick={() => {
							void copyToClipboard("cedric@kirdes.dev");
						}}
					>
						cedric@kirdes.dev
					</button>
					<span> / </span>
					<a
						href="https://github.com/kirdesmf"
						className="underline-offset-2 hover:text-primary hover:underline"
						target="_blank"
						rel="noreferrer"
					>
						github.com/kirdesmf
					</a>
				</div>
				<div>
					<span className={labelClass}>STATUS</span>
					<span>open for freelance &amp; collaboration</span>
				</div>
			</div>
		</div>
	);
}

export function WhoamiOutput(): ReactNode {
	return (
		<div className="flex flex-col whitespace-pre-wrap font-mono text-foreground/90">
			<p className="font-thin text-muted-foreground/70 uppercase tracking-wider">[WHOAMI]</p>
			<Separator className="mt-1 mb-2 opacity-50" />
			<div className="flex flex-col gap-0.5">
				<p>kirdes</p>
				<p className="text-muted-foreground">product engineer / interface builder</p>
				<p className="mt-1 text-muted-foreground/70">
					for more, visit{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={showRoutePanelSearch}
						to="/terminal/about"
					>
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
			<p>cedric@kirdes.dev</p>
			<p className="text-muted-foreground">copy requested</p>
		</div>
	);
}
