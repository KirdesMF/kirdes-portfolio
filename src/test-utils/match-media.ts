import { act } from "@testing-library/react";

export function installMatchMedia(initialMatches = false) {
	let matches = initialMatches;
	const listeners = new Set<EventListenerOrEventListenerObject>();

	const mediaQueryList = {
		get matches() {
			return matches;
		},
		media: "",
		onchange: null,
		addEventListener: (_event: "change", listener: EventListenerOrEventListenerObject) => {
			listeners.add(listener);
		},
		removeEventListener: (_event: "change", listener: EventListenerOrEventListenerObject) => {
			listeners.delete(listener);
		},
		addListener: (listener: EventListenerOrEventListenerObject) => listeners.add(listener),
		removeListener: (listener: EventListenerOrEventListenerObject) => listeners.delete(listener),
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
				for (const listener of listeners) {
					if (typeof listener === "function") {
						listener(event);
					} else {
						listener.handleEvent(event);
					}
				}
			});
		},
	};
}
