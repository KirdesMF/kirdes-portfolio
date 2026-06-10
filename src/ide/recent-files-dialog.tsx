import { useNavigate } from "@tanstack/react-router";
import { FileText, History } from "lucide-react";
import { useMemo } from "react";
import { CommandDialog, CommandEmpty, CommandItem, CommandList } from "#/design-system/command";
import { findEditorFile } from "#/editor/editor-files";
import { getNeoTreeFilePaths } from "#/ide/neo-tree";
import { useIdeStore } from "#/ide/store";

export function RecentFilesDialog() {
	const open = useIdeStore((s) => s.recentFilesOpen);
	const setOpen = useIdeStore((s) => s.setRecentFilesOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const recentFiles = useIdeStore((s) => s.recentFiles);
	const navigate = useNavigate();

	const candidates = useMemo(() => {
		const treeFilePaths = getNeoTreeFilePaths();

		return recentFiles.flatMap((fileId) => {
			const file = findEditorFile(fileId);
			const displayName = treeFilePaths.get(fileId);
			if (!file || !displayName) return [];
			return [{ file, displayName }];
		});
	}, [recentFiles]);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) setEditorMode("normal");
	}

	function selectFile(fileId: string) {
		void navigate({
			to: "/editor",
			search: { file: fileId, neotree: "open" as const },
		});
		setOpen(false);
		setEditorMode("normal");
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,24rem)]"
			description="Recently opened files. Select one to reopen it."
			open={open}
			title="RECENT FILES"
			onOpenChange={handleOpenChange}
		>
			<CommandList className="min-h-0 flex-1 p-0 pt-2">
				<CommandEmpty className="py-6">
					<div className="flex flex-col items-center gap-2">
						<History className="size-5 text-muted-foreground/40" />
						<span>No recent files yet.</span>
						<span className="text-muted-foreground/60 text-tiny">
							Open a file to populate this list.
						</span>
					</div>
				</CommandEmpty>
				{candidates.map((candidate) => (
					<CommandItem
						className="rounded-none px-2 text-muted-foreground"
						key={candidate.file.id}
						value={candidate.file.id}
						onSelect={() => selectFile(candidate.file.id)}
					>
						<FileText className="size-3 shrink-0" />
						<span className="truncate">{candidate.displayName}</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
