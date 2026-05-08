export const terminalFiles = [
	{
		name: "README.md",
		language: "markdown",
		content: `# kirdes portfolio

Terminal-first portfolio interface built with TanStack Start, React, and Tailwind CSS.

Use commands to explore:

- ls: list routes and files
- cd work: navigate sections
- cat README.md: print file contents
- open README.md: open read-only editor
- close: close editor
`,
	},
	{
		name: "stack.json",
		language: "json",
		content: `{
  "framework": "TanStack Start",
  "runtime": "Cloudflare Workers",
  "ui": ["React", "Tailwind CSS"],
  "language": "TypeScript"
}`,
	},
	{
		name: "profile.ts",
		language: "typescript",
		content: `export const profile = {
  name: "kirdes",
  role: "product engineer / interface builder",
  focus: ["frontend architecture", "design systems", "developer tooling"],
} as const
`,
	},
] as const;

export type TerminalFileName = (typeof terminalFiles)[number]["name"];

export function findTerminalFile(name: string) {
	const normalized = name.trim().toLowerCase();
	return terminalFiles.find((file) => file.name.toLowerCase() === normalized) ?? null;
}
