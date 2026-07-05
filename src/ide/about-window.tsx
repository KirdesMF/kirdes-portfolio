import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { contactInfo } from "#/data";
import { FloatingWindow, FloatingWindowLayer } from "#/design-system/floating-window";

type WindowKey = "about" | "contact";

export function AboutWindow() {
	const navigate = useNavigate();
	const search = useRouterState({ select: (s) => s.location.search }) as {
		about?: "open";
		contact?: "open";
	};
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [activeWindow, setActiveWindow] = useState<WindowKey>("contact");

	function closeWindow(key: WindowKey) {
		void navigate({
			to: pathname,
			search: (prev) => ({ ...prev, [key]: undefined }),
		});
	}

	if (search.about !== "open" && search.contact !== "open") return null;

	return (
		<FloatingWindowLayer>
			{search.about === "open" ? (
				<FloatingWindow
					className="top-[42%] left-[48%] w-[min(88vw,30rem)]"
					isActive={activeWindow === "about"}
					title="ABOUT"
					onClose={() => closeWindow("about")}
					onFocus={() => setActiveWindow("about")}
				>
					<div className="grid gap-3 text-muted-foreground">
						<p>
							I’m Cédric Gourville, a software engineer focused on building clear,
							fast, and maintainable web interfaces.
						</p>
						<p>
							I like small systems, strong product taste, and codebases that stay easy to
							change after the first version ships.
						</p>
						<p>
							For work, collaboration, or a quick intro, the best place to contact me is
							by email at <span className="text-foreground">{contactInfo.email}</span>.
						</p>
					</div>
				</FloatingWindow>
			) : null}
			{search.contact === "open" ? (
				<FloatingWindow
					className="top-[56%] left-[58%] w-[min(84vw,24rem)]"
					isActive={activeWindow === "contact"}
					title="CONTACT"
					onClose={() => closeWindow("contact")}
					onFocus={() => setActiveWindow("contact")}
				>
					<div className="grid gap-2 text-muted-foreground">
						<a className="text-foreground underline-offset-4 hover:underline" href={`mailto:${contactInfo.email}`}>
							{contactInfo.email}
						</a>
						<a className="text-foreground underline-offset-4 hover:underline" href={contactInfo.linkedin.url} rel="noreferrer" target="_blank">
							LinkedIn / {contactInfo.linkedin.handle} ↗
						</a>
						<a className="text-foreground underline-offset-4 hover:underline" href={contactInfo.github.url} rel="noreferrer" target="_blank">
							GitHub / {contactInfo.github.handle} ↗
						</a>
						<a className="text-foreground underline-offset-4 hover:underline" href={contactInfo.x.url} rel="noreferrer" target="_blank">
							X / {contactInfo.x.handle} ↗
						</a>
					</div>
				</FloatingWindow>
			) : null}
		</FloatingWindowLayer>
	);
}
