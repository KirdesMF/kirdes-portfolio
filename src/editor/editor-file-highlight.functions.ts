import { createServerFn } from "@tanstack/react-start";
import { highlightEditorFile } from "./editor-file-highlight.server";

export const getHighlightedEditorFile = createServerFn({ method: "GET" })
	.inputValidator((data: { fileName: string }) => data)
	.handler(async ({ data }) => highlightEditorFile(data.fileName));
