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
import { findEditorFile, getEditorFilePaths } from "#/editor/editor-files";
import { useIdeStore } from "#/ide/store";

type TextMatch = {
	fileId: string;
	filePath: string;
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
		const treeFilePaths = getEditorFilePaths();

		return Array.from(treeFilePaths.entries()).map(([fileId, filePath]) => ({
			fileId,
			filePath,
			searchText: filePath.toLowerCase(),
		}));
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
		const file = findEditorFile(match.fileId);
		if (!file) return;

		void navigate({
			to: file.route,
		});
		setOpen(false);
		setEditorMode("normal");
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,28rem)]"
			contentClassName="w-[min(92vw,42rem)]"
			description="Search file names and open the selected page."
			open={open}
			title="FIND TEXT"
			onOpenChange={handleOpenChange}
		>
			<div className="relative flex shrink-0 items-center border-border border-b">
				<CommandInput
					autoFocus
					className="h-9 border-b-0 px-0 pr-20 text-xs"
					placeholder="Find file text..."
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
					{search.trim() ? "No matches found." : "Type to search file names."}
				</CommandEmpty>
				{matches.map((match) => (
					<CommandItem
						className="grid grid-cols-[1rem_1fr] gap-x-2 rounded-none px-2 text-muted-foreground"
						key={match.fileId}
						value={match.fileId}
						onSelect={() => selectMatch(match)}
					>
						<FileText className="mt-0.5 size-3 shrink-0" />
						<span className="min-w-0">
							<span className="block truncate text-foreground">{match.filePath}</span>
							<span className="block truncate text-muted-foreground text-tiny">
								Page content search will return with the content rebuild.
							</span>
						</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
