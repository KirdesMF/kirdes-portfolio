import { createFileRoute } from "@tanstack/react-router";
import { TetrisGame } from "#/games/tetris/TetrisGame";

export const Route = createFileRoute("/lab/tetris")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="h-dvh w-full grid place-items-center">
			<TetrisGame />
		</div>
	);
}
