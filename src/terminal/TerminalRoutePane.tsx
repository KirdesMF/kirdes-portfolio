import type { ReactNode } from "react";
import { cn } from "#/design-system/cn";

export function TerminalRoutePane({
	children,
	className,
	hasEditorPanel,
}: {
	children: ReactNode;
	className?: string;
	hasEditorPanel: boolean;
}) {
	return (
		<div
			className={cn(
				"min-h-0 w-full flex-1 overflow-y-auto p-3",
				hasEditorPanel && "md:border-b md:border-border",
				className,
			)}
		>
			{children}
		</div>
	);
}
