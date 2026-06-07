import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/design-system/cn";

type DialogProps = ComponentProps<typeof BaseDialog.Root>;
type DialogTriggerProps = ComponentProps<typeof BaseDialog.Trigger>;
type DialogCloseProps = ComponentProps<typeof BaseDialog.Close>;
type DialogContentProps = Omit<ComponentProps<typeof BaseDialog.Popup>, "className"> & {
	className?: string;
};
type DialogTitleProps = Omit<ComponentProps<typeof BaseDialog.Title>, "className"> & {
	className?: string;
};
type DialogDescriptionProps = Omit<ComponentProps<typeof BaseDialog.Description>, "className"> & {
	className?: string;
};

export function Dialog(props: DialogProps): ReactNode {
	return <BaseDialog.Root {...props} />;
}

export function DialogTrigger(props: DialogTriggerProps): ReactNode {
	return <BaseDialog.Trigger {...props} />;
}

export function DialogClose(props: DialogCloseProps): ReactNode {
	return <BaseDialog.Close {...props} />;
}

export function DialogContent({ children, className, ...props }: DialogContentProps): ReactNode {
	return (
		<BaseDialog.Portal>
			<BaseDialog.Backdrop className="fixed inset-0" />
			<BaseDialog.Popup
				className={cn(
					"fixed top-1/2 inset-s-1/2 max-h-[min(90dvh,42rem)] w-[min(92vw,32rem)] -translate-1/2 rounded bg-popover p-3 text-popover-foreground outline-none",
					className,
				)}
				{...props}
			>
				{children}
			</BaseDialog.Popup>
		</BaseDialog.Portal>
	);
}

export function DialogTitle({ className, ...props }: DialogTitleProps): ReactNode {
	return <BaseDialog.Title className={cn("font-medium", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps): ReactNode {
	return (
		<BaseDialog.Description className={cn("text-muted-foreground text-xs", className)} {...props} />
	);
}
