import { createServerFn } from "@tanstack/react-start";
import { highlightFileTokens } from "./editor-file-highlight.server";

function parseHighlightEditorFileInput(input: unknown): { fileName: string } {
	if (typeof input !== "object" || input === null || !("fileName" in input)) {
		throw new Error("fileName is required");
	}

	const fileName = input.fileName;
	if (typeof fileName !== "string") {
		throw new Error("fileName must be a string");
	}

	const trimmed = fileName.trim();
	if (trimmed.length === 0) {
		throw new Error("fileName is required");
	}

	return { fileName: trimmed };
}

export const getFileTokens = createServerFn({ method: "GET" })
	.validator(parseHighlightEditorFileInput)
	.handler(async ({ data }) => highlightFileTokens(data.fileName));
