import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { ArrowBigUp, Command } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type TooltipShortcutKey = "cmd" | "shift" | string;

type TooltipProps = {
	children: ReactElement;
	content: ReactNode;
	shortcut?: readonly TooltipShortcutKey[];
};

function TooltipShortcut({ shortcut }: { shortcut: readonly TooltipShortcutKey[] }): ReactNode {
	return (
		<kbd className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 font-medium text-xs text-secondary-foreground uppercase">
			{shortcut.map((key) => (
				<span className="inline-flex items-center justify-center" key={key}>
					{key === "cmd" ? <Command className="size-2.5" /> : null}
					{key === "shift" ? <ArrowBigUp className="size-2.5" /> : null}
					{key !== "cmd" && key !== "shift" ? key : null}
				</span>
			))}
		</kbd>
	);
}

export function Tooltip({ children, content, shortcut }: TooltipProps): ReactNode {
	return (
		<BaseTooltip.Provider delay={0}>
			<BaseTooltip.Root>
				<BaseTooltip.Trigger render={children} />
				<BaseTooltip.Portal>
					<BaseTooltip.Positioner side="bottom" sideOffset={6}>
						<BaseTooltip.Popup
							className={cn(
								"flex items-center gap-2 rounded-lg border border-border bg-popover px-2 py-1 text-popover-foreground text-xs shadow-md",
								"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:translate-y-0.5 data-starting-style:translate-y-0.5",
								"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
							)}
						>
							<span>{content}</span>
							{shortcut ? <TooltipShortcut shortcut={shortcut} /> : null}
						</BaseTooltip.Popup>
					</BaseTooltip.Positioner>
				</BaseTooltip.Portal>
			</BaseTooltip.Root>
		</BaseTooltip.Provider>
	);
}
