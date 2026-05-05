import type { ReactNode } from "react";

import { EditorFooter } from "#/editor/EditorFooter";
import { EditorHeader } from "#/editor/EditorHeader";
import { EditorShell } from "#/editor/EditorShell";

export function EditorPage({ children }: { children?: ReactNode }): ReactNode {
	return (
		<div className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
			<EditorHeader />
			<EditorShell>{children}</EditorShell>
			<EditorFooter />
		</div>
	);
}
