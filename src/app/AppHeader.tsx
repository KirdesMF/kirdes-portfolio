import { ThemeToggle } from "#/theme/ThemeToggle";

export function AppHeader(): React.ReactNode {
	return (
		<header className="flex h-8 items-center justify-end border-b border-border px-2">
			<ThemeToggle />
		</header>
	);
}
