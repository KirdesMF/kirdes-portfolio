import { ClientOnly } from "@tanstack/react-router";
import { Folder } from "lucide-react";
import { Separator } from "#/design-system/Separator";
import { AppHeaderNavigation } from "#/layout/AppHeaderNavigation";
import { AppHeaderTime } from "#/layout/AppHeaderTime";
import { ThemeToggle } from "#/theme/ThemeToggle";

export function AppHeader() {
	return (
		<header className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
			<div className="flex min-w-0 items-center gap-2 text-sm">
				<Folder className="size-3.5 shrink-0 text-primary" />
				<AppHeaderNavigation />
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<span className="text-tiny text-muted-foreground">FR | EN</span>
				<Separator orientation="vertical" />
				<ClientOnly fallback={null}>
					<AppHeaderTime />
				</ClientOnly>
				<Separator orientation="vertical" />
				<ThemeToggle />
			</div>
		</header>
	);
}
