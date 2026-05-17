export function json(content: Record<string, unknown> | Array<unknown>): string {
	return JSON.stringify(content, null, 2);
}

export function md(...lines: Array<string>): string {
	return lines.join("\n");
}

export function tsx(str: TemplateStringsArray): string {
	return str[0];
}
