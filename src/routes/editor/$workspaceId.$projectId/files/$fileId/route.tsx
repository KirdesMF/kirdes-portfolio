import { createFileRoute } from "@tanstack/react-router";

import { getEditorFakeFile } from "#/editor/editor-files";

export const Route = createFileRoute("/editor/$workspaceId/$projectId/files/$fileId")({
	component: EditorProjectFileRoute,
});

function EditorProjectFileRoute(): React.ReactNode {
	const { fileId } = Route.useParams();
	const selectedFile = getEditorFakeFile(fileId);

	if (!selectedFile) {
		return (
			<div className="rounded-md border border-border bg-sidebar p-4">
				<p className="font-medium">File not found</p>
				<p className="mt-1 text-muted-foreground text-xs">
					Unknown file: <code>{fileId}</code>
				</p>
			</div>
		);
	}

	return (
		<div className="grid overflow-hidden rounded-md border border-border bg-sidebar">
			<header className="border-b border-border px-3 py-2">
				<p className="font-medium">{selectedFile.name}</p>
				<p className="mt-1 text-muted-foreground text-xs">{selectedFile.path}</p>
			</header>
			<pre className="overflow-auto p-3 text-muted-foreground text-xs leading-5">
				<code>{selectedFile.content}</code>
			</pre>
		</div>
	);
}
