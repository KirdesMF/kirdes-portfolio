import { createFileRoute, Outlet } from "@tanstack/react-router";

import { EditorPage } from "#/editor/EditorPage";
import { validateEditorSearch } from "#/editor/editor-search";

export const Route = createFileRoute("/editor")({
	validateSearch: validateEditorSearch,
	component: EditorRoute,
});

function EditorRoute() {
	return (
		<EditorPage>
			<Outlet />
		</EditorPage>
	);
}
