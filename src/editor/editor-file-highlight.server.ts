import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import json from "shiki/langs/json.mjs";
import markdown from "shiki/langs/markdown.mjs";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import githubDarkDefault from "shiki/themes/github-dark-default.mjs";
import githubLightDefault from "shiki/themes/github-light-default.mjs";
import { findEditorFile } from "#/editor/editor-files";
import type { EditorHighlightNode, EditorHighlightProperties } from "./editor-highlight-types";

type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: Array<HastNode>;
};

const supportedTagNames = ["pre", "code", "span", "a"] as const;

const highlighterPromise = createHighlighterCore({
	engine: createJavaScriptRegexEngine(),
	langs: [json, markdown, typescript, tsx],
	themes: [githubDarkDefault, githubLightDefault],
});

function normalizeClassName(value: unknown): string | undefined {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.filter((entry) => typeof entry === "string").join(" ");

	return undefined;
}

function toCamelCaseProperty(propertyName: string): string {
	if (propertyName.startsWith("--")) return propertyName;

	return propertyName.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function normalizeStyle(value: unknown): Record<string, string> | undefined {
	if (typeof value !== "string") return undefined;

	const entries = value
		.split(";")
		.map((declaration) => declaration.trim())
		.filter(Boolean)
		.map((declaration) => declaration.split(":"))
		.filter(([key, propertyValue]) => typeof key === "string" && typeof propertyValue === "string")
		.map(
			([key, propertyValue]) => [toCamelCaseProperty(key.trim()), propertyValue.trim()] as const,
		);

	return Object.fromEntries(entries);
}

function normalizeTabIndex(value: unknown): number | undefined {
	if (typeof value === "number") return value;
	if (typeof value !== "string") return undefined;

	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function isSupportedTagName(tagName: string): tagName is (typeof supportedTagNames)[number] {
	return supportedTagNames.includes(tagName as (typeof supportedTagNames)[number]);
}

function normalizeHastNode(node: HastNode): EditorHighlightNode | null {
	if (node.type === "text") {
		return { type: "text", value: node.value ?? "" };
	}

	if (node.type !== "element") return null;
	if (typeof node.tagName !== "string") return null;
	if (!isSupportedTagName(node.tagName)) return null;

	const properties = node.properties ?? {};
	const children = (node.children ?? [])
		.map((child) => normalizeHastNode(child))
		.filter((child) => child !== null);

	return {
		type: "element",
		tagName: node.tagName,
		properties: {
			className: normalizeClassName(properties.class),
			href: typeof properties.href === "string" ? properties.href : undefined,
			style: normalizeStyle(properties.style),
			tabIndex: normalizeTabIndex(properties.tabindex),
		} satisfies EditorHighlightProperties,
		children,
	};
}

const urlRegex = /(https?:\/\/[^\s"'<>]+)/g;

function injectLinksIntoNode(node: HastNode): Array<HastNode> {
	if (node.type === "text") {
		const text = node.value ?? "";
		const parts = text.split(urlRegex);
		if (parts.length === 1) return [node];

		const result: Array<HastNode> = [];
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (!part) continue;
			if (i % 2 === 1) {
				result.push({
					type: "element",
					tagName: "a",
					properties: { href: part },
					children: [{ type: "text", value: part }],
				});
			} else {
				result.push({ type: "text", value: part });
			}
		}
		return result;
	}

	if (node.children) {
		node.children = node.children.flatMap(injectLinksIntoNode);
	}

	return [node];
}

function injectLinks(hast: HastNode): HastNode {
	if (hast.children) {
		hast.children = hast.children.flatMap(injectLinksIntoNode);
	}
	return hast;
}

export async function highlightEditorFile(fileName: string) {
	const file = findEditorFile(fileName);
	if (file === null) {
		return {
			found: false as const,
			fileName,
		};
	}

	const highlighter = await highlighterPromise;
	const rawHast = highlighter.codeToHast(file.content, {
		lang: file.language,
		themes: {
			light: "github-light-default",
			dark: "github-dark-default",
		},
	}) as HastNode;

	const hast = injectLinks(rawHast);

	const preNode = hast.children?.find(
		(child): child is HastNode => child.type === "element" && child.tagName === "pre",
	);
	const nodes = (hast.children ?? [])
		.map((child) => normalizeHastNode(child))
		.filter((node) => node !== null);

	return {
		found: true as const,
		fileName: file.name,
		language: file.language,
		nodes,
		preClassName: normalizeClassName(preNode?.properties?.class),
	};
}
