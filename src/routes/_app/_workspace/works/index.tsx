import { createFileRoute } from "@tanstack/react-router";
import { RouteFileEditor } from "#/editor/route-file-editor";

const fileId = "src/routes/works/index.md";

const workRows = [
	["terminal-portfolio", "10.3 KB", "Interactive terminal portfolio shell"],
	["workspace-ui", "5.8 KB", "Editor frame, tabs, file tree"],
	["ascii-banner", "4.8 KB", "Canvas banner, shimmer effects"],
	["command-menu", "4.7 KB", "Keyboard navigation, ranked search"],
	["theme-system", "4.5 KB", "Light/dark IDE color palettes"],
	["availability-status", "3.5 KB", "Work status, contact context"],
	["page-line-status", "3.4 KB", "Scroll-aware line number status"],
	["work-notes", "2.7 KB", "Markdown-inspired case studies"],
	["settings-drawer", "2.3 KB", "Theme, language preferences"],
	["neo-tree", "2.0 KB", "Workspace file navigation"],
	["contact-dialog", "1.9 KB", "Focused links, quick reach out"],
	["terminal-session", "1.8 KB", "Prompt, commands, transcript UI"],
] as const;

const tableColumns = [
	{ header: "Work", width: 28 },
	{ header: "Size", width: 8 },
	{ header: "Description", width: 36 },
] as const;

function divider() {
	return `+${tableColumns.map((column) => "-".repeat(column.width + 2)).join("+")}+`;
}

function row(values: readonly string[]) {
	return `| ${values.map((value, index) => value.padEnd(tableColumns[index]?.width ?? value.length)).join(" | ")} |`;
}

const worksTable = [
	divider(),
	row(tableColumns.map((column) => column.header)),
	divider(),
	...workRows.map((work) => row(work)),
	divider(),
].join("\n");

export const Route = createFileRoute("/_app/_workspace/works/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<RouteFileEditor fileId={fileId}>
			<article className="space-y-10 font-mono text-foreground">
				<h1 className="font-normal text-xl text-muted-foreground uppercase tracking-wide">
					<span className="text-muted-foreground/35">##</span> WORKS
				</h1>

				<div className="overflow-x-auto pb-2">
					<pre className="min-w-max text-xs leading-5">{worksTable}</pre>
				</div>
			</article>
		</RouteFileEditor>
	);
}
