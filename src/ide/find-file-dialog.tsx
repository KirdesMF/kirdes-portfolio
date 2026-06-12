import { useNavigate } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/design-system/command";
import { findEditorFile } from "#/editor/editor-files";
import { getNeoTreeFilePaths } from "#/ide/neo-tree";
import { useIdeStore } from "#/ide/store";

export function FindFileDialog() {
	const open = useIdeStore((s) => s.findFileOpen);
	const setOpen = useIdeStore((s) => s.setFindFileOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const requestEditorFocus = useIdeStore((s) => s.requestEditorFocus);
	const navigate = useNavigate();
	const [search, setSearch] = useState("");

	const candidates = useMemo(() => {
		const treeFilePaths = getNeoTreeFilePaths();

		return Array.from(treeFilePaths.entries()).flatMap(([fileId, displayName]) => {
			const file = findEditorFile(fileId);
			if (!file) return [];

			return {
				file,
				displayName,
				searchText: `${file.id} ${displayName}`.toLowerCase(),
			};
		});
	}, []);

	const filteredCandidates = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return candidates;
		return candidates.filter((candidate) => candidate.searchText.includes(query));
	}, [candidates, search]);

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
		requestEditorFocus();
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,24rem)]"
			description="Search files and open the selected file in the editor."
			open={open}
			title="FIND FILE"
			onOpenChange={handleOpenChange}
		>
			<div className="relative flex shrink-0 items-center border-border border-b">
				<CommandInput
					autoFocus
					className="h-9 border-b-0 px-0 pr-16 text-xs"
					placeholder="Find file..."
					value={search}
					onValueChange={setSearch}
					onFocus={() => setEditorMode("insert")}
				/>
				<span className="absolute right-0 text-muted-foreground text-xs tabular-nums">
					{filteredCandidates.length}/{candidates.length}
				</span>
			</div>
			<CommandList className="min-h-0 flex-1 p-0 pt-2">
				<CommandEmpty className="py-6">No files found.</CommandEmpty>
				{filteredCandidates.map(({ displayName, file }) => (
					<CommandItem
						className="rounded-none px-2 text-muted-foreground"
						key={file.id}
						value={file.id}
						onSelect={() => selectFile(file.id)}
					>
						<FileText className="size-3 shrink-0" />
						<span className="truncate">{displayName}</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
