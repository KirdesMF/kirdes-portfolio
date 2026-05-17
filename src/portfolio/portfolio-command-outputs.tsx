import type { ReactNode } from "react";
import { copyToClipboard } from "#/design-system/clipboard";

export function StatusOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5 whitespace-pre-wrap font-mono text-foreground/90">
			<div>
				<span className="text-muted-foreground/60">LOCATION </span>
				<span>Paris, France</span>
			</div>
			<div>
				<span className="text-muted-foreground/60">FOCUS </span>
				<span>frontend architecture — design systems — dev tooling</span>
			</div>
			<div>
				<span className="text-muted-foreground/60">CONTACT </span>
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
				<span className="text-muted-foreground/60">STATUS </span>
				<span>open for freelance &amp; collaboration</span>
			</div>
		</div>
	);
}

export function WhoamiOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>kirdes</p>
			<p className="text-muted-foreground">product engineer / interface builder</p>
			<p className="mt-1 text-muted-foreground/70">for more, visit /about</p>
		</div>
	);
}

export function EmailOutput(): ReactNode {
	return (
		<div className="flex flex-col gap-0.5">
			<p>cedric@kirdes.dev</p>
			<p className="text-muted-foreground">copied to clipboard</p>
		</div>
	);
}
