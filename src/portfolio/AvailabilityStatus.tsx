import { animate, stagger } from "animejs";
import { scrambleText } from "animejs/text";
import { MoveRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "#/design-system/Popover";

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
		title: "Open to work",
		description:
			"Actively looking for new opportunities. Open to full-time, contract, or freelance roles.",
	},
	"open-to-offers": {
		dotColor: "bg-status-open-offers",
		label: "OFFERS",
		title: "Open to offers",
		description: "Not actively searching but open to interesting opportunities and conversations.",
	},
	busy: {
		dotColor: "bg-status-busy",
		label: "BUSY",
		title: "Busy",
		description: "Fully committed to current projects — not available for new work right now.",
	},
};

export function AvailabilityStatus({ status }: AvailabilityStatusProps) {
	const config = STATUS_CONFIG[status];
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const elements = rootRef.current?.querySelectorAll("[data-anim-item]");
		if (!elements) return;

		const anim = animate(elements, {
			ease: "linear",
			innerHTML: scrambleText({
				cursor: "░▒▓█",
				delay: stagger(100),
			}),
		});

		return () => {
			anim.revert();
		};
	}, []);

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
				<PopoverDescription>{config.description}</PopoverDescription>
			</PopoverContent>
		</Popover>
	);
}
