import { createFileRoute } from "@tanstack/react-router";
import { contactInfo } from "#/data";
import { RouteFileEditor } from "#/editor/route-file-editor";
import { m } from "#/paraglide/messages";

const fileId = "src/routes/contact.md";

export const Route = createFileRoute("/_app/_workspace/contact")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<article className="space-y-8 font-mono text-xs leading-7 text-foreground">
				<header className="space-y-4">
					<p className="text-muted-foreground text-tiny tracking-widest">{"/* contact.md */"}</p>
					<h1 className="font-normal text-base text-foreground uppercase">
						<span className="text-muted-foreground/50">##</span> {m.contact_page_title()}
					</h1>
				</header>

				<section className="max-w-xl leading-5 space-y-2 text-muted-foreground">
					<p>{m.contact_page_intro()}</p>
					<p>{m.contact_page_followup()}</p>
				</section>

				<section className="space-y-2 text-muted-foreground">
					<p>
						<span className="text-muted-foreground/50">**email**:</span>{" "}
						<a
							className="text-foreground underline-offset-4 hover:underline"
							href={`mailto:${contactInfo.email}`}
						>
							{contactInfo.email}
						</a>
					</p>
					<p>
						<span className="text-muted-foreground/50">**x.com**:</span>{" "}
						<a
							className="text-foreground underline-offset-4 hover:underline"
							href={contactInfo.x.url}
							rel="noreferrer"
							target="_blank"
						>
							{contactInfo.x.handle} ↗
						</a>
					</p>
					<p>
						<span className="text-muted-foreground/50">**linkedin**:</span>{" "}
						<a
							className="text-foreground underline-offset-4 hover:underline"
							href={contactInfo.linkedin.url}
							rel="noreferrer"
							target="_blank"
						>
							{contactInfo.linkedin.handle} ↗
						</a>
					</p>
					<p>
						<span className="text-muted-foreground/50">**github**:</span>{" "}
						<a
							className="text-foreground underline-offset-4 hover:underline"
							href={contactInfo.github.url}
							rel="noreferrer"
							target="_blank"
						>
							{contactInfo.github.handle} ↗
						</a>
					</p>
				</section>
			</article>
		</RouteFileEditor>
	);
}
