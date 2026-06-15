import { createFileRoute } from "@tanstack/react-router";
import { HomeEditorRoute } from "#/editor/route-file-editor";

export const Route = createFileRoute("/_app/start")({
	component: HomeEditorRoute,
});
