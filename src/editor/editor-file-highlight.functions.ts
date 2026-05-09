import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";
import { highlightToHtml } from "./editor-file-highlight.server";

const HighlightEditorFileInputSchema = v.object({
	fileName: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export const getHighlightedEditorFile = createServerFn({ method: "GET" })
	.inputValidator(v.parser(HighlightEditorFileInputSchema))
	.handler(async ({ data }) => highlightToHtml(data.fileName));
