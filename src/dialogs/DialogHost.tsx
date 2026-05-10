import { MusicDialog } from "#/music/MusicDialog";
import type { TerminalDialogName } from "#/music/music.types";

export function DialogHost({
	dialog,
	onClose,
}: {
	dialog?: TerminalDialogName;
	onClose: () => void;
}) {
	if (dialog === "music") return <MusicDialog onClose={onClose} />;

	return null;
}
