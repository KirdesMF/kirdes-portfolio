import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { darkThemeIds, lightThemeIds } from "#/theme/theme.types";

const css = readFileSync("src/styles.css", "utf8");
const themeIds = [...lightThemeIds, ...darkThemeIds];

const requiredThemeTokens = [
	"background",
	"foreground",
	"card",
	"primary",
	"primary-foreground",
	"secondary",
	"secondary-foreground",
	"muted",
	"muted-foreground",
	"accent",
	"accent-foreground",
	"destructive",
	"destructive-foreground",
	"border",
	"input",
	"ring",
	"status",
	"status-foreground",
	"status-muted",
	"status-muted-foreground",
	"command-shortcut",
	"command-status",
	"command-status-foreground",
] as const;

const sharedAliases = {
	"card-foreground": "var(--foreground)",
	popover: "var(--card)",
	"popover-foreground": "var(--foreground)",
	page: "var(--background)",
	"status-primary": "var(--primary)",
	"status-primary-foreground": "var(--primary-foreground)",
} as const;

const contrastPairs = [
	["foreground", "background"],
	["primary", "background"],
	["primary-foreground", "primary"],
	["muted-foreground", "background"],
	["command-shortcut", "background"],
	["accent-foreground", "accent"],
	["destructive-foreground", "destructive"],
	["status-foreground", "status"],
	["status-primary-foreground", "status-primary"],
	["status-muted-foreground", "status-muted"],
	["command-status-foreground", "command-status"],
] as const;

type Color = { lightness: number; chroma: number; hue: number };
type Rgb = { red: number; green: number; blue: number };
type Tokens = Record<string, string>;

function parseTokens(selector: string): Tokens {
	const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const body = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)`))?.[1];
	expect(body, `Missing CSS block for ${selector}`).toBeDefined();

	return Object.fromEntries(
		[...(body ?? "").matchAll(/--([\w-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2]]),
	);
}

const rootTokens = parseTokens(":root");

function resolveToken(tokens: Tokens, name: string): string {
	let value = tokens[name] ?? rootTokens[name];
	const visited = new Set<string>();

	while (value?.startsWith("var(--")) {
		const referencedName = value.slice(6, -1);
		if (visited.has(referencedName)) throw new Error(`Circular token reference: ${name}`);
		visited.add(referencedName);
		value = tokens[referencedName] ?? rootTokens[referencedName];
	}

	if (!value) throw new Error(`Missing token: ${name}`);
	return value;
}

function parseOklch(value: string): Color {
	const match = value.match(/^oklch\(([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)\)$/);
	if (!match) throw new Error(`Expected an OKLCH color, received: ${value}`);

	return {
		lightness: Number(match[1]) / (match[2] ? 100 : 1),
		chroma: Number(match[3]),
		hue: Number(match[4]),
	};
}

function toSrgb(color: Color): Rgb {
	const hue = (color.hue * Math.PI) / 180;
	const a = color.chroma * Math.cos(hue);
	const b = color.chroma * Math.sin(hue);
	const l = (color.lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
	const m = (color.lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
	const s = (color.lightness - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;

	function gamma(value: number) {
		const linear = Math.max(0, Math.min(1, value));
		return linear <= 0.003_130_8 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
	}

	return {
		red: gamma(4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s),
		green: gamma(-1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s),
		blue: gamma(-0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s),
	};
}

function relativeLuminance(color: Rgb): number {
	function linearize(channel: number) {
		return channel <= 0.040_45 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	}

	return (
		0.2126 * linearize(color.red) + 0.7152 * linearize(color.green) + 0.0722 * linearize(color.blue)
	);
}

function contrastRatio(first: Color, second: Color): number {
	const firstLuminance = relativeLuminance(toSrgb(first));
	const secondLuminance = relativeLuminance(toSrgb(second));
	return (
		(Math.max(firstLuminance, secondLuminance) + 0.05) /
		(Math.min(firstLuminance, secondLuminance) + 0.05)
	);
}

function oklabDistance(first: Color, second: Color): number {
	const firstHue = (first.hue * Math.PI) / 180;
	const secondHue = (second.hue * Math.PI) / 180;
	return Math.hypot(
		first.lightness - second.lightness,
		first.chroma * Math.cos(firstHue) - second.chroma * Math.cos(secondHue),
		first.chroma * Math.sin(firstHue) - second.chroma * Math.sin(secondHue),
	);
}

describe("theme CSS", () => {
	test("declares shared semantic relationships once", () => {
		for (const [token, alias] of Object.entries(sharedAliases)) {
			expect(rootTokens[token], token).toBe(alias);
		}
	});

	test("keeps the dark banner tied to the active theme primary", () => {
		const darkTokens = parseTokens(".dark");
		expect(darkTokens["ascii-banner-text"]).toBe("var(--status-primary)");
		expect(darkTokens["ascii-banner-glow"]).toBe("var(--status-primary)");
	});

	test.each(themeIds)("%s defines a literal-only theme palette", (themeId) => {
		const tokens = parseTokens(`[data-theme="${themeId}"]`);
		expect(Object.keys(tokens)).toEqual(expect.arrayContaining([...requiredThemeTokens]));
		expect(Object.keys(tokens)).not.toEqual(expect.arrayContaining(Object.keys(sharedAliases)));
		expect(Object.values(tokens).every((value) => value.startsWith("oklch("))).toBe(true);
	});

	test.each(themeIds)("%s keeps text contrast at 4.5:1 or better", (themeId) => {
		const tokens = parseTokens(`[data-theme="${themeId}"]`);

		for (const [foreground, background] of contrastPairs) {
			const ratio = contrastRatio(
				parseOklch(resolveToken(tokens, foreground)),
				parseOklch(resolveToken(tokens, background)),
			);
			expect(ratio, `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
		}
	});

	test.each(themeIds)("%s makes shortcut and command-mode colors distinct", (themeId) => {
		const tokens = parseTokens(`[data-theme="${themeId}"]`);
		const shortcutDistance = oklabDistance(
			parseOklch(resolveToken(tokens, "command-shortcut")),
			parseOklch(resolveToken(tokens, "primary")),
		);
		const commandModeDistance = oklabDistance(
			parseOklch(resolveToken(tokens, "command-status")),
			parseOklch(resolveToken(tokens, "status-primary")),
		);
		expect(shortcutDistance, "command-shortcut compared with primary").toBeGreaterThanOrEqual(0.1);
		expect(
			commandModeDistance,
			"command-status compared with status-primary",
		).toBeGreaterThanOrEqual(0.1);
	});
});
