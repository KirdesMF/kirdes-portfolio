export const editorProjectValues = [
	"welcome",
	"about",
	"projects",
	"skills",
	"contact",
	"help-command",
	"game",
	"motion",
] as const;

export const editorWorkspaceValues = ["workspace-1", "workspace-2"] as const;

export type EditorProjectValue = (typeof editorProjectValues)[number];
export type EditorWorkspaceValue = (typeof editorWorkspaceValues)[number];

export type EditorProject = {
	additions: number;
	branch: string;
	deletions: number;
	id: EditorProjectValue;
	label: string;
};

export type EditorWorkspace = {
	id: EditorWorkspaceValue;
	label: string;
	projects: readonly EditorProject[];
};

export const editorWorkspaces: readonly EditorWorkspace[] = [
	{
		id: "workspace-1",
		label: "Workspace 1",
		projects: [
			{ id: "welcome", label: "welcome", branch: "main", additions: 0, deletions: 0 },
			{ id: "about", label: "about", branch: "feature/about", additions: 42, deletions: 8 },
			{
				id: "projects",
				label: "projects",
				branch: "feature/projects",
				additions: 128,
				deletions: 31,
			},
			{ id: "skills", label: "skills", branch: "feature/skills", additions: 64, deletions: 12 },
			{ id: "contact", label: "contact", branch: "feature/contact", additions: 24, deletions: 4 },
			{
				id: "help-command",
				label: "help command",
				branch: "feature/help-command",
				additions: 36,
				deletions: 9,
			},
		],
	},
	{
		id: "workspace-2",
		label: "Workspace 2",
		projects: [
			{ id: "game", label: "game", branch: "feature/game", additions: 217, deletions: 53 },
			{ id: "motion", label: "Motion", branch: "feature/motion", additions: 89, deletions: 14 },
		],
	},
];

const editorProjectValueSet: ReadonlySet<string> = new Set(editorProjectValues);
const editorWorkspaceValueSet: ReadonlySet<string> = new Set(editorWorkspaceValues);

export function isEditorProjectValue(value: unknown): value is EditorProjectValue {
	return typeof value === "string" && editorProjectValueSet.has(value);
}

export function isEditorWorkspaceValue(value: unknown): value is EditorWorkspaceValue {
	return typeof value === "string" && editorWorkspaceValueSet.has(value);
}

export function getEditorProject(projectId: string | undefined): EditorProject | undefined {
	return editorWorkspaces
		.flatMap((workspace): readonly EditorProject[] => workspace.projects)
		.find((project) => project.id === projectId);
}

export function getEditorProjectInWorkspace(
	workspaceId: EditorWorkspaceValue,
	projectId: string | undefined,
): EditorProject | undefined {
	return getEditorWorkspace(workspaceId).projects.find((project) => project.id === projectId);
}

export function getEditorWorkspace(workspaceId: EditorWorkspaceValue): EditorWorkspace {
	return editorWorkspaces.find(({ id }) => id === workspaceId) ?? editorWorkspaces[0];
}

export function getEditorProjectWorkspace(
	projectId: EditorProjectValue,
): EditorWorkspace | undefined {
	return editorWorkspaces.find((workspace) =>
		workspace.projects.some((project) => project.id === projectId),
	);
}

export function getEditorWorkspaceDefaultProject(
	workspaceId: EditorWorkspaceValue,
): EditorProject | undefined {
	return getEditorWorkspace(workspaceId).projects[0];
}

export function isEditorProjectInWorkspace(
	projectId: EditorProjectValue,
	workspaceId: EditorWorkspaceValue,
): boolean {
	return getEditorWorkspace(workspaceId).projects.some((project) => project.id === projectId);
}
