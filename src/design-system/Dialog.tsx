import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "#/design-system/cn";

type DialogProps = ComponentProps<typeof BaseDialog.Root>;
type DialogTriggerProps = ComponentProps<typeof BaseDialog.Trigger>;
type DialogPortalProps = ComponentProps<typeof BaseDialog.Portal>;
type DialogCloseProps = ComponentProps<typeof BaseDialog.Close>;
type DialogOverlayProps = Omit<ComponentProps<typeof BaseDialog.Backdrop>, "className"> & {
	className?: string;
};
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

export function DialogPortal(props: DialogPortalProps): ReactNode {
	return <BaseDialog.Portal {...props} />;
}

export function DialogClose(props: DialogCloseProps): ReactNode {
	return <BaseDialog.Close {...props} />;
}

export function DialogOverlay({ className, ...props }: DialogOverlayProps): ReactNode {
	return (
		<BaseDialog.Backdrop
			className={cn(
				"fixed inset-0 z-50 bg-black/10",
				"data-ending-style:opacity-0 data-starting-style:opacity-0",
				"transition-opacity duration-150 ease-editor-shell motion-reduce:transition-none",
				className,
			)}
			{...props}
		/>
	);
}

export function DialogContent({ children, className, ...props }: DialogContentProps): ReactNode {
	return (
		<DialogPortal>
			<DialogOverlay />
			<BaseDialog.Popup
				className={cn(
					"fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none",
					"data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95",
					"transition-[opacity,transform] duration-150 ease-editor-shell motion-reduce:transition-none",
					className,
				)}
				{...props}
			>
				{children}
			</BaseDialog.Popup>
		</DialogPortal>
	);
}

export function DialogTitle({ className, ...props }: DialogTitleProps): ReactNode {
	return <BaseDialog.Title className={cn("font-medium text-sm", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps): ReactNode {
	return (
		<BaseDialog.Description
			className={cn("mt-1 text-muted-foreground text-xs", className)}
			{...props}
		/>
	);
}
