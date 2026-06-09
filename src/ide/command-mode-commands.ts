import type { AppearanceSettings } from "#/theme/theme.types";

type CommandExecutionContext = {
	appearance: AppearanceSettings;
	setAppearance: (appearance: AppearanceSettings) => void;
	setLocale: (locale: "en" | "fr") => void;
};

export type CommandModeCommand = {
	name: string;
	description: string;
	aliases: string[];
	execute: (ctx: CommandExecutionContext) => void;
};

export const commandModeCommands: CommandModeCommand[] = [
	{
		name: "dark",
		description: "Switch appearance mode to dark.",
		aliases: ["dark"],
		execute: ({ appearance, setAppearance }) => setAppearance({ ...appearance, mode: "dark" }),
	},
	{
		name: "light",
		description: "Switch appearance mode to light.",
		aliases: ["light"],
		execute: ({ appearance, setAppearance }) => setAppearance({ ...appearance, mode: "light" }),
	},
	{
		name: "auto",
		description: "Use the system appearance mode.",
		aliases: ["auto", "system"],
		execute: ({ appearance, setAppearance }) => setAppearance({ ...appearance, mode: "system" }),
	},
	{
		name: "lfr",
		description: "Switch language to French.",
		aliases: ["lfr", "fr", "lang fr", "lang french"],
		execute: ({ setLocale }) => setLocale("fr"),
	},
	{
		name: "len",
		description: "Switch language to English.",
		aliases: ["len", "en", "lang en", "lang english"],
		execute: ({ setLocale }) => setLocale("en"),
	},
];

export function normalizeCommand(input: string) {
	return input.trim().replace(/^:/, "").replace(/\s+/g, " ").toLowerCase();
}

export function findCommand(input: string) {
	const normalized = normalizeCommand(input);
	return commandModeCommands.find((command) =>
		command.aliases.some((alias) => alias === normalized),
	);
}
