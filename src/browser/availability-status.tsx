import { Link } from "@tanstack/react-router";
import { MoveRight } from "lucide-react";
import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "#/design-system/popover";
import { Separator } from "#/design-system/separator";
import { useScrambleRef } from "#/design-system/use-scramble-ref";
import { m } from "#/paraglide/messages";
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
		label: m.avail_open_to_work_label(),
		title: m.avail_open_to_work_title(),
		description: m.avail_open_to_work_description(),
	},
	"open-to-offers": {
		dotColor: "bg-status-open-offers",
		label: m.avail_open_to_offers_label(),
		title: m.avail_open_to_offers_title(),
		description: m.avail_open_to_offers_description(),
	},
	busy: {
		dotColor: "bg-status-busy",
		label: m.avail_busy_label(),
		title: m.avail_busy_title(),
		description: m.avail_busy_description(),
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
				<span data-anim-item>{m.avail_label()}</span>
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
