import { useEffect, useState } from "react";

export function useMediaQuery(query: string, fallback = false): boolean {
	const [matches, setMatches] = useState(fallback);

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		const updateMatches = () => setMatches(mediaQuery.matches);

		updateMatches();
		mediaQuery.addEventListener("change", updateMatches);

		return () => mediaQuery.removeEventListener("change", updateMatches);
	}, [query]);

	return matches;
}

export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 767px)", false);
}
