import { Link } from "@tanstack/react-router";
import { MoveRight } from "lucide-react";
import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "#/design-system/Popover";
import { Separator } from "#/design-system/Separator";
import { useScrambleRef } from "#/design-system/useScrambleRef";
import { showRoutePanelSearch } from "#/terminal/terminal-search-transitions";

export type Availability = "open-to-work" | "open-to-offers" | "busy";

type AvailabilityStatusProps = {
	status: Availability;
};

const STATUS_CONFIG: Record<
	Availability,
	{ dotColor: string; label: string; title: string; description: string }
> = {
	"open-to-work": {
		dotColor: "bg-status-open",
		label: "OPEN",
		title: "[OPEN TO WORK]",
		description:
			"Actively looking for new opportunities. Open to full-time, contract, or freelance roles.",
	},
	"open-to-offers": {
		dotColor: "bg-status-open-offers",
		label: "OFFERS",
		title: "[OPEN TO OFFERS]",
		description: "Not actively searching but open to interesting opportunities and conversations.",
	},
	busy: {
		dotColor: "bg-status-busy",
		label: "BUSY",
		title: "[BUSY]",
		description: "Fully committed to current projects — not available for new work right now.",
	},
};

export function AvailabilityStatus({ status }: AvailabilityStatusProps) {
	const config = STATUS_CONFIG[status];
	const [open, setOpen] = useState(false);
	const rootRef = useScrambleRef<HTMLButtonElement>({
		selector: "[data-anim-item]",
		staggerMs: 100,
	});

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger ref={rootRef} className="flex cursor-pointer items-center gap-1.5">
				<span className={`inline-block size-1.5 rounded-full ${config.dotColor}`} />
				<span data-anim-item>AVAILABLE</span>
				<MoveRight className="size-3" />
				<span data-anim-item>{config.label}</span>
			</PopoverTrigger>
			<PopoverContent>
				<PopoverTitle>{config.title}</PopoverTitle>
				<Separator className="my-2 opacity-50" />
				<PopoverDescription>{config.description}</PopoverDescription>
				<p className="mt-2 font-mono text-tiny text-muted-foreground/50">
					<Link
						className="underline-offset-2 hover:text-primary hover:underline"
						search={showRoutePanelSearch}
						to="/terminal/contact"
					>
						{"/* contact */"}
					</Link>
				</p>
			</PopoverContent>
		</Popover>
	);
}
