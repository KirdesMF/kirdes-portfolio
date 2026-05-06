import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ReactElement, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type MenuProps = {
	children: ReactElement;
	items: readonly {
		href: string;
		label: string;
	}[];
};

export function Menu({ children, items }: MenuProps): ReactNode {
	return (
		<BaseMenu.Root>
			<BaseMenu.Trigger render={children} />
			<BaseMenu.Portal>
				<BaseMenu.Positioner align="end" side="top" sideOffset={8}>
					<BaseMenu.Popup
						className={cn(
							"min-w-40 rounded-md border border-border bg-popover text-popover-foreground text-xs shadow-md",
							"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:translate-y-1 data-starting-style:translate-y-1",
							"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
						)}
					>
						{items.map(({ href, label }) => (
							<BaseMenu.LinkItem
								className="block rounded-sm px-2 py-1.5 text-muted-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus:bg-sidebar-accent focus:text-sidebar-foreground data-highlighted:bg-sidebar-accent data-highlighted:text-sidebar-foreground"
								closeOnClick
								href={href}
								key={label}
								label={label}
							>
								{label}
							</BaseMenu.LinkItem>
						))}
					</BaseMenu.Popup>
				</BaseMenu.Positioner>
			</BaseMenu.Portal>
		</BaseMenu.Root>
	);
}
