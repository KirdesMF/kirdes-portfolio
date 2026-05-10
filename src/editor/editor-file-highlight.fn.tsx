import { createServerFn } from "@tanstack/react-start";
import { renderServerComponent } from "@tanstack/react-start/rsc";
import * as v from "valibot";
import { highlightToHtml } from "./editor-file-highlight.server";

const HighlightEditorFileInputSchema = v.object({
	fileName: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

async function HighlightedEditorFile({ fileName }: { fileName: string }) {
	const result = await highlightToHtml(fileName);

	if (!result.found) {
		return <div className="p-3 text-muted-foreground">unable to open {result.fileName}</div>;
	}

	return (
		<div className="editor-code min-h-0 flex-1 overflow-auto p-2">
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is server-generated from local files */}
			<div dangerouslySetInnerHTML={{ __html: result.html }} />
		</div>
	);
}

export const getHighlightedEditorFileRsc = createServerFn({ method: "GET" })
	.inputValidator(v.parser(HighlightEditorFileInputSchema))
	.handler(async ({ data }) => ({
		HighlightedEditorFile: await renderServerComponent(
			<HighlightedEditorFile fileName={data.fileName} />,
		),
	}));
