import { createFileRoute } from "@tanstack/react-router";

import { EditorPage } from "#/editor/EditorPage";
import { validateEditorSearch } from "#/editor/editor-search";

export const Route = createFileRoute("/editor")({
	validateSearch: validateEditorSearch,
	component: EditorRoute,
});

function EditorRoute() {
	return (
		<EditorPage>
			<main className="min-h-0 overflow-hidden bg-background" />
		</EditorPage>
	);
}
