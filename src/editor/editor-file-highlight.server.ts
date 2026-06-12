import json from "@shikijs/langs/json";
import markdown from "@shikijs/langs/markdown";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import githubDarkDefault from "@shikijs/themes/github-dark-default";
import githubLightDefault from "@shikijs/themes/github-light-default";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { findEditorFile } from "#/editor/editor-files";

export type FileTokenLine = Array<{
	content: string;
	offset: number;
	lightColor?: string;
	darkColor?: string;
}>;

type HighlightResult =
	| { found: false; fileName: string }
	| { found: true; fileName: string; lines: FileTokenLine[]; language: string };

const highlighterPromise = createHighlighterCore({
	engine: createJavaScriptRegexEngine(),
	langs: [json, markdown, typescript, tsx],
	themes: [githubDarkDefault, githubLightDefault],
});

export async function highlightFileTokens(fileName: string): Promise<HighlightResult> {
	const file = findEditorFile(fileName);
	if (file === null) {
		return { found: false, fileName };
	}

	const highlighter = await highlighterPromise;
	const tokens = highlighter.codeToTokensWithThemes(file.content, {
		lang: file.language,
		themes: {
			light: "github-light-default",
			dark: "github-dark-default",
		},
	});

	const lines = tokens.map((line) =>
		line.map((token) => ({
			content: token.content,
			offset: token.offset,
			lightColor: token.variants.light?.color,
			darkColor: token.variants.dark?.color,
		})),
	);

	return {
		found: true,
		fileName: file.name,
		lines,
		language: file.language,
	};
}
