import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/markdown";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import githubLightDefault from "@shikijs/themes/github-light-default";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { findEditorFile } from "#/editor/editor-files";

type HighlightResult =
	| { found: false; fileName: string }
	| { found: true; fileName: string; html: string; language: string };

const highlighterPromise = createHighlighterCore({
	engine: createJavaScriptRegexEngine(),
	langs: [json, markdown, typescript, tsx],
	themes: [githubDarkDefault, githubLightDefault],
});

export async function highlightToHtml(fileName: string): Promise<HighlightResult> {
	const file = findEditorFile(fileName);
	if (file === null) {
		return { found: false, fileName };
	}

	const highlighter = await highlighterPromise;
	const html = highlighter.codeToHtml(file.content, {
		lang: file.language,
		themes: {
			light: "github-light-default",
			dark: "github-dark-default",
		},
	});

	return {
		found: true,
		fileName: file.name,
		html,
		language: file.language,
	};
}
