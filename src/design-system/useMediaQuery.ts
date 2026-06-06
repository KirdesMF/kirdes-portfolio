import { useEffect, useState } from "react";

export function useMediaQuery(query: string, fallback = false): boolean {
	const getMatches = () => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return fallback;
		}

		return window.matchMedia(query).matches;
	};

	const [matches, setMatches] = useState(getMatches);

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			setMatches(fallback);
			return;
		}

		const mediaQuery = window.matchMedia(query);
		const updateMatches = () => setMatches(mediaQuery.matches);

		updateMatches();
		mediaQuery.addEventListener("change", updateMatches);

		return () => mediaQuery.removeEventListener("change", updateMatches);
	}, [fallback, query]);

	return matches;
}

export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 767px)", false);
}
