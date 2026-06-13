import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { contactInfo } from "#/contact/contact-info";
import { copyToClipboard } from "#/design-system/clipboard";
import {
	CommandDialog,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/design-system/command";
import { toastManager } from "#/design-system/toast";

type ContactsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const contactItems = [
	{
		id: "email",
		Icon: Mail,
		label: "Email",
		detail: contactInfo.email,
		action: () => {
			void copyToClipboard(contactInfo.email).then((copied) => {
				toastManager.add({
					description: copied ? contactInfo.email : "Clipboard permission denied.",
					title: copied ? "Email copied" : "Copy failed",
					type: copied ? "success" : "error",
				});
			});
		},
	},
	{
		id: "x",
		Icon: Twitter,
		label: "X",
		detail: contactInfo.x.handle,
		action: () => {
			window.open(contactInfo.x.url, "_blank", "noreferrer");
		},
	},
	{
		id: "linkedin",
		Icon: Linkedin,
		label: "LinkedIn",
		detail: "cedric-gourville",
		action: () => {
			window.open(contactInfo.linkedin.url, "_blank", "noreferrer");
		},
	},
	{
		id: "github",
		Icon: Github,
		label: "GitHub",
		detail: contactInfo.github.handle,
		action: () => {
			window.open(contactInfo.github.url, "_blank", "noreferrer");
		},
	},
];

export function ContactsDialog({ open, onOpenChange }: ContactsDialogProps) {
	return (
		<CommandDialog
			commandClassName="h-auto"
			description="Contact information. Select an item to copy or open."
			open={open}
			title="CONTACTS"
			onOpenChange={onOpenChange}
		>
			<CommandInput aria-label="Search contacts" autoFocus className="sr-only" />
			<CommandList className="min-h-0 p-0 pt-2">
				<CommandGroup>
					{contactItems.map((item) => (
						<CommandItem
							className="rounded-none px-2 text-muted-foreground"
							key={item.id}
							value={item.id}
							onSelect={() => {
								item.action();
								onOpenChange(false);
							}}
						>
							<item.Icon className="size-3 shrink-0" />
							<span className="truncate">{item.label}</span>
							<span className="ml-auto text-muted-foreground/60 text-tiny tabular-nums">
								{item.detail}
							</span>
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
