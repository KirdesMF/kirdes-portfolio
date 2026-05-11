import { createFileRoute } from "@tanstack/react-router";
import { TetrisGame } from "#/games/tetris/TetrisGame";

export const Route = createFileRoute("/lab/tetris")({
	component: TetrisGame,
});
