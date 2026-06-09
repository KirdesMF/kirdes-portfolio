import { FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
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

type TextMatch = {
	fileId: string;
	filePath: string;
	lineNumber: number;
	lineText: string;
	searchText: string;
};

const MAX_MATCHES = 100;

export function FindTextDialog() {
	const open = useIdeStore((s) => s.findTextOpen);
	const setOpen = useIdeStore((s) => s.setFindTextOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const navigate = useNavigate();
	const [search, setSearch] = useState("");

	const index = useMemo(() => {
		const treeFilePaths = getNeoTreeFilePaths();

		return Array.from(treeFilePaths.entries()).flatMap(([fileId, filePath]) => {
			const file = findEditorFile(fileId);
			if (!file) return [];

			return file.content.split(/\r?\n/).map((lineText, lineIndex) => ({
				fileId,
				filePath,
				lineNumber: lineIndex + 1,
				lineText,
				searchText: `${filePath} ${lineText}`.toLowerCase(),
			}));
		});
	}, []);

	const matches = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return [];
		return index.filter((match) => match.searchText.includes(query)).slice(0, MAX_MATCHES);
	}, [index, search]);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) setEditorMode("normal");
	}

	function selectMatch(match: TextMatch) {
		void navigate({
			to: "/editor",
			search: { file: match.fileId, neotree: "open" as const },
		});
		setOpen(false);
		setEditorMode("normal");
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,28rem)]"
			contentClassName="w-[min(92vw,42rem)]"
			description="Search text in explorer files and open the selected match in the editor."
			open={open}
			title="FIND TEXT"
			onOpenChange={handleOpenChange}
		>
			<div className="relative flex shrink-0 items-center border-border border-b">
				<CommandInput
					autoFocus
					className="h-9 border-b-0 px-0 pr-20 text-xs"
					placeholder="Find text..."
					value={search}
					onFocus={() => setEditorMode("insert")}
					onValueChange={setSearch}
				/>
				<span className="absolute right-0 text-muted-foreground text-xs tabular-nums">
					{matches.length}/{index.length}
				</span>
			</div>
			<CommandList className="min-h-0 flex-1 p-0 pt-2">
				<CommandEmpty className="py-6">
					{search.trim() ? "No matches found." : "Type to search text."}
				</CommandEmpty>
				{matches.map((match) => (
					<CommandItem
						className="grid grid-cols-[1rem_1fr] gap-x-2 rounded-none px-2 text-muted-foreground"
						key={`${match.fileId}:${match.lineNumber}`}
						value={`${match.fileId}:${match.lineNumber}`}
						onSelect={() => selectMatch(match)}
					>
						<FileText className="mt-0.5 size-3 shrink-0" />
						<span className="min-w-0">
							<span className="block truncate text-foreground">
								{match.filePath}:{match.lineNumber}
							</span>
							<span className="block truncate text-muted-foreground text-tiny">
								{match.lineText.trim() || "∅"}
							</span>
						</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
