import { CharactersLinesRepelRenderer } from "../webgl/effects/characters-lines-repel";
import type { AnimationRoute } from "../webgl-text";

export const CharactersLinesRepelAnimation = {
	path: "/lab/characters-lines-repel",
	label: "Character Lines Repel",
	mode: "characters-lines-repel",
	createRenderer: (canvas) => new CharactersLinesRepelRenderer(canvas),
} satisfies AnimationRoute;
