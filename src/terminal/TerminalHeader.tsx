import { ClientOnly } from "@tanstack/react-router";
import { Folder } from "lucide-react";
import { Separator } from "#/design-system/Separator";
import { ThemeToggle } from "#/theme/ThemeToggle";
import { TerminalTime } from "./TerminalTime";

export function TerminalHeader() {
	return (
		<header className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
			<div className="flex items-center gap-2 text-sm">
				<Folder className="size-3.5 text-primary" />
				<span className="font-medium text-foreground">~</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-tiny text-muted-foreground">FR | EN</span>
				<Separator orientation="vertical" />
				<ClientOnly fallback={null}>
					<TerminalTime />
				</ClientOnly>
				<Separator orientation="vertical" />
				<ThemeToggle />
			</div>
		</header>
	);
}
