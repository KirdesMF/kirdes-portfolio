import { useRouter } from "@tanstack/react-router";
import { type EditorFileName, resolveFile } from "#/editor/editor-files";
import type { TerminalPanelName } from "./terminal-panel.types";
import type { TerminalRoutePath } from "./terminal-routes";
import {
	closeEditorFileSearch,
	closeEditorSearch,
	keepTerminalSearch,
	openEditorFileSearch,
	openEditorPanelSearch,
	type TerminalSearchDraft,
} from "./terminal-search-transitions";

export function useTerminalSearchActions({
	activeFileName,
	currentTerminalRoute,
	isTerminalOnlyRoute,
	openFileNames,
}: {
	activeFileName?: EditorFileName;
	currentTerminalRoute: TerminalRoutePath;
	isTerminalOnlyRoute: boolean;
	openFileNames: Array<EditorFileName>;
}) {
	const router = useRouter();

	function navigate(to: string, search?: TerminalSearchDraft): void {
		// biome-ignore lint/suspicious/noExplicitAny: router.navigate generics are too strict for dynamic routes
		void (router.navigate as any)({
			to,
			search: (previous: TerminalSearchDraft) => keepTerminalSearch(previous, search),
		});
	}

	function reload(): void {
		void router.navigate({
			search: {},
			to: "/",
		});
	}

	function setMobilePanel(panel: TerminalPanelName): void {
		void router.navigate({
			search: (previous) => keepTerminalSearch(previous, { panel }),
			to: currentTerminalRoute,
		});
	}

	function closeEditor(): void {
		void router.navigate({
			search: (previous) => closeEditorSearch(previous, { isTerminalOnlyRoute }),
			to: currentTerminalRoute,
		});
	}

	function closeFile(fileName: string): void {
		const file = resolveFile(fileName, currentTerminalRoute);
		if (file === null) return;

		void router.navigate({
			search: (previous) =>
				closeEditorFileSearch(previous, {
					activeFileName,
					closedFileName: file.id,
					openFileNames,
				}),
			to: currentTerminalRoute,
		});
	}

	function openEditor(): void {
		void router.navigate({
			search: openEditorPanelSearch,
			to: currentTerminalRoute,
		});
	}

	function openFile(name: string): boolean {
		const file = resolveFile(name, currentTerminalRoute);
		if (file === null) return false;

		void router.navigate({
			search: (previous) => openEditorFileSearch(previous, file.id),
			to: currentTerminalRoute,
		});
		return true;
	}

	function selectFile(fileName: string): void {
		const file = resolveFile(fileName, currentTerminalRoute);
		if (file === null) return;

		void router.navigate({
			search: (previous) => openEditorFileSearch(previous, file.id),
			to: currentTerminalRoute,
		});
	}

	return {
		closeEditor,
		closeFile,
		navigate,
		openEditor,
		openFile,
		reload,
		selectFile,
		setMobilePanel,
	};
}
