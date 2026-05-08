import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, steps } from "motion/react";

const bootLines = ["initializing shell", "loading profile", "mounting terminal"] as const;

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const handleAnimationComplete = () => {
		navigate({
			replace: true,
			search: { file: undefined, files: [], panel: "terminal" },
			to: "/terminal",
		});
	};

	return (
		<div className="flex h-dvh items-center justify-center bg-background font-mono text-xs text-foreground">
			<div className="flex w-full max-w-md flex-col gap-2 rounded border border-border bg-background/80 p-4">
				<div className="text-muted-foreground">kirdes terminal boot</div>
				<motion.div
					initial="hidden"
					animate="visible"
					onAnimationComplete={handleAnimationComplete}
					variants={{
						visible: {
							transition: {
								staggerChildren: 0.6,
								delayChildren: 0.1,
							},
						},
					}}
				>
					{bootLines.map((line) => (
						<motion.div
							key={line}
							variants={{
								hidden: { opacity: 0, y: 4 },
								visible: { opacity: 1, y: 0 },
							}}
							className="flex gap-2"
						>
							<span className="text-primary">›</span>
							<span>{line}...</span>
						</motion.div>
					))}
				</motion.div>
				<motion.span
					className="text-primary"
					animate={{ opacity: [1, 0, 1] }}
					transition={{
						duration: 1,
						repeat: Number.POSITIVE_INFINITY,
						ease: steps(2, "end"),
					}}
				>
					█
				</motion.span>
			</div>
		</div>
	);
}
