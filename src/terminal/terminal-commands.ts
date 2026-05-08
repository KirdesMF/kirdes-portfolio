export type CommandHandler = (args: string[]) => string | undefined;

function handleHelp(): string {
	return [
		"Available commands:",
		"  help\t\tShow this help",
		"  contacts\tList contact information",
	].join("\n");
}

function handleContacts(): string {
	return [
		"",
		"── contacts ──",
		"",
		"  twitter\t@kirdesmf",
		"  email\t\tcedric@kirdes.dev",
		"  github\tgithub.com/kirdesmf",
		"",
	].join("\n");
}

export const commands: Record<string, CommandHandler> = {
	help: handleHelp,
	contacts: handleContacts,
};

export function getCommandResponse(input: string): string {
	const parts = input.split(" ");
	const commandName = parts[0]?.toLowerCase();
	const args = parts.slice(1);

	const handler = commands[commandName];

	if (!handler) {
		return `command not found: ${commandName}`;
	}

	return handler(args) ?? "";
}
