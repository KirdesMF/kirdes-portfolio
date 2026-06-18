import { createFileRoute } from "@tanstack/react-router";
import { EmptyEditor } from "#/editor/empty-editor";

export const Route = createFileRoute("/_app/start")({
	component: EmptyEditor,
});
