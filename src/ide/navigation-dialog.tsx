import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useMemo, useState } from "react";
import { CommandDialog, CommandInput, CommandItem, CommandList } from "#/design-system/command";
import { useIdeStore } from "#/ide/store";

const navigationItems = [
	{ label: "Home", route: "/home" },
	{ label: "About", route: "about" },
	{ label: "Contact", route: "contact" },
	{ label: "Works", route: "/works" },
] as const;

export function NavigationDialog() {
	const open = useIdeStore((s) => s.navigationOpen);
	const setOpen = useIdeStore((s) => s.setNavigationOpen);
	const setEditorMode = useIdeStore((s) => s.setEditorMode);
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [search, setSearch] = useState("");

	const filteredNavigationItems = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return navigationItems;
		return navigationItems.filter((item) =>
			`${item.label} ${item.route}`.toLowerCase().includes(query),
		);
	}, [search]);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		setEditorMode(nextOpen ? "insert" : "normal");
		if (!nextOpen) setSearch("");
	}

	function openRoute(route: (typeof navigationItems)[number]["route"]) {
		if (route === "about" || route === "contact") {
			void navigate({
				to: pathname,
				search: (prev) => ({ ...prev, [route]: "open" as const }),
			});
		} else {
			void navigate({ to: route });
		}
		setOpen(false);
		setSearch("");
		setEditorMode("normal");
	}

	return (
		<CommandDialog
			commandClassName="h-[min(70dvh,18rem)]"
			description="Choose a route to open in the editor."
			open={open}
			title="NAVIGATION"
			onOpenChange={handleOpenChange}
		>
			<CommandInput
				autoFocus
				className="h-9 border-b-0 px-0 text-xs"
				placeholder="Navigate..."
				value={search}
				onFocus={() => setEditorMode("insert")}
				onValueChange={setSearch}
			/>
			<CommandList className="min-h-0 flex-1 p-0 pt-2">
				{filteredNavigationItems.map((item) => (
					<CommandItem
						className="rounded-none px-2 text-muted-foreground"
						key={item.route}
						value={`${item.label} ${item.route}`}
						onSelect={() => openRoute(item.route)}
					>
						<Compass className="size-3 shrink-0" />
						<span>{item.label}</span>
						<span className="ms-auto text-command-shortcut">{item.route}</span>
					</CommandItem>
				))}
			</CommandList>
		</CommandDialog>
	);
}
