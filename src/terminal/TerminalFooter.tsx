import { useScrambleRef } from "#/design-system/useScrambleRef";

export function TerminalFooter() {
	const rootRef = useScrambleRef<HTMLDivElement>({
		selector: "[data-anim-footer]",
		staggerMs: 100,
	});

	return (
		<div
			ref={rootRef}
			className="flex h-status-bar shrink-0 items-center border-t border-border px-3 text-tiny text-muted-foreground"
		>
			<span data-anim-footer>TIP: type help for commands -- / to navigate</span>
		</div>
	);
}
