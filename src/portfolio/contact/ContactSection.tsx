import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
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

function SourceLinks({ meta: m }: { meta: NonNullable<(typeof sectionMetadata)[string]> }) {
	return (
		<div className="mt-4 border-t border-border pt-3 text-muted-foreground/60">
			<div className="mb-1 text-tiny uppercase tracking-wider">implementation</div>
			<div className="flex flex-col gap-0.5">
				<span>
					renderer:{" "}
					<Link
						className="text-primary underline-offset-2 hover:underline"
						search={(prev) => ({
							activeFile: m.renderer,
							dialog: prev.dialog,
							editor: "open" as const,
							files: prev.files ? [...new Set([...prev.files, m.renderer])] : [m.renderer],
							panel: "editor" as const,
						})}
						to="."
					>
						{m.renderer}
					</Link>
				</span>
				<span>
					content:{" "}
					{m.contentFiles.map((file, i) => (
						<span key={file}>
							<Link
								className="text-primary underline-offset-2 hover:underline"
								search={(prev) => {
									const id = `${m.folder}/${file}`;
									return {
										activeFile: id,
										dialog: prev.dialog,
										editor: "open" as const,
										files: prev.files ? [...new Set([...prev.files, id])] : [id],
										panel: "editor" as const,
									};
								}}
								to="."
							>
								{file}
							</Link>
							{i < m.contentFiles.length - 1 ? ", " : ""}
						</span>
					))}
				</span>
			</div>
		</div>
	);
}
