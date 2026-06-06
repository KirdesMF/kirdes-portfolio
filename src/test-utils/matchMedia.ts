import { act } from "@testing-library/react";

export function installMatchMedia(initialMatches = false) {
	let matches = initialMatches;
	const listeners = new Set<(event: MediaQueryListEvent) => void>();

	const mediaQueryList = {
		get matches() {
			return matches;
		},
		media: "",
		onchange: null,
		addEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
			listeners.add(listener);
		},
		removeEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
			listeners.delete(listener);
		},
		addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
		removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
		dispatchEvent: () => true,
	} as MediaQueryList;

	Object.defineProperty(window, "matchMedia", {
		configurable: true,
		writable: true,
		value: () => mediaQueryList,
	});

	return {
		setMatches(nextMatches: boolean) {
			act(() => {
				matches = nextMatches;
				const event = { matches, media: mediaQueryList.media } as MediaQueryListEvent;
				for (const listener of listeners) listener(event);
			});
		},
	};
}
