import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SlidingPuzzle } from "#/components/sliding-puzzle";

export const Route = createFileRoute("/_app/about")({
	component: AboutPage,
});

function AboutPage() {
	const navigate = useNavigate();

	function openContact() {
		void navigate({
			to: "/about",
			search: (previous) => ({ ...previous, contact: "open" }),
		});
	}

	return (
		<article className="relative isolate h-full overflow-auto bg-editor font-mono text-foreground">
			<div className="relative z-10 mx-auto grid min-h-full w-full max-w-4xl content-center gap-8 p-6 sm:p-10 md:grid-cols-[minmax(0,3fr)_minmax(13rem,2fr)] md:gap-12">
				<div className="grid content-start gap-6">
					<p className="text-muted-foreground text-tiny">~/about/cedric-gourville.md</p>
					<header className="grid gap-3">
						<p className="text-primary text-tiny uppercase">Software engineer</p>
						<p className="max-w-xl text-muted-foreground text-xs">
							I build clear, fast, and maintainable web interfaces with close attention to product
							and interaction details.
						</p>
					</header>

					<div className="grid max-w-xl gap-4 text-muted-foreground text-xs leading-6">
						<p>
							I prefer small systems with explicit boundaries: enough structure to support the
							product, without making the codebase harder to change than it needs to be.
						</p>
						<p>
							My work sits between engineering and product craft, from interface architecture and
							design systems to the details that make an experience feel responsive and coherent.
						</p>
					</div>
				</div>

				<aside className="grid content-start gap-7 border-border border-t-thin pt-6 md:border-t-0 md:border-l-thin md:pt-0 md:pl-8">
					<SlidingPuzzle />

					<section className="grid gap-3">
						<h2 className="text-primary text-tiny uppercase">Focus</h2>
						<ul className="grid gap-2 text-muted-foreground text-xs">
							<li>
								<span className="text-primary">→</span> Interface architecture
							</li>
							<li>
								<span className="text-primary">→</span> Design systems
							</li>
							<li>
								<span className="text-primary">→</span> Interactive web experiences
							</li>
						</ul>
					</section>

					<section className="grid gap-3">
						<h2 className="text-primary text-tiny uppercase">Status</h2>
						<p className="text-muted-foreground text-xs leading-5">
							Open to freelance and full-time opportunities.
						</p>
					</section>

					<div className="flex flex-wrap gap-3 text-tiny">
						<Link
							className="border-thin border-primary bg-primary px-3 py-2 text-primary-foreground hover:bg-transparent hover:text-primary focus:bg-transparent focus:text-primary focus:outline-none"
							search={{}}
							to="/works"
						>
							View works
						</Link>
						<button
							className="border-thin border-border px-3 py-2 text-foreground hover:border-primary hover:text-primary focus:border-primary focus:text-primary focus:outline-none"
							type="button"
							onClick={openContact}
						>
							Contact
						</button>
					</div>
				</aside>
			</div>
			<p
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-4 select-none font-serif font-extrabold text-[clamp(5rem,16vw,13rem)] text-muted-foreground/5 leading-[0.7] tracking-[-0.06em] sm:left-8"
			>
				About
			</p>
		</article>
	);
}
