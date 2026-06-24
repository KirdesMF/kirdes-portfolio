import { Toast as BaseToast } from "@base-ui/react/toast";
import { XIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/design-system/cn";

type ToastProviderProps = ComponentProps<typeof BaseToast.Provider>;
type ToastPortalProps = ComponentProps<typeof BaseToast.Portal>;
type ToastViewportProps = Omit<ComponentProps<typeof BaseToast.Viewport>, "className"> & {
	className?: string;
};
type ToastRootProps = Omit<ComponentProps<typeof BaseToast.Root>, "className"> & {
	className?: string;
};
type ToastContentProps = Omit<ComponentProps<typeof BaseToast.Content>, "className"> & {
	className?: string;
};
type ToastTitleProps = Omit<ComponentProps<typeof BaseToast.Title>, "className"> & {
	className?: string;
};
type ToastDescriptionProps = Omit<ComponentProps<typeof BaseToast.Description>, "className"> & {
	className?: string;
};
type ToastActionProps = Omit<ComponentProps<typeof BaseToast.Action>, "className"> & {
	className?: string;
};
type ToastCloseProps = Omit<ComponentProps<typeof BaseToast.Close>, "className"> & {
	className?: string;
};
type ToastPositionerProps = Omit<ComponentProps<typeof BaseToast.Positioner>, "className"> & {
	className?: string;
};
type ToastArrowProps = Omit<ComponentProps<typeof BaseToast.Arrow>, "className"> & {
	className?: string;
};

export const toastManager = BaseToast.createToastManager();

export function ToastProvider({
	toastManager: manager = toastManager,
	...props
}: ToastProviderProps) {
	return <BaseToast.Provider toastManager={manager} {...props} />;
}

export function ToastPortal(props: ToastPortalProps): ReactNode {
	return <BaseToast.Portal {...props} />;
}

export function ToastViewport({ className, ...props }: ToastViewportProps): ReactNode {
	return (
		<BaseToast.Viewport
			className={cn(
				"fixed right-3 bottom-[calc(var(--spacing-status-bar)+0.75rem)] z-screen-effect flex w-[min(92vw,24rem)] flex-col gap-2 outline-none",
				className,
			)}
			{...props}
		/>
	);
}

export function ToastRoot({ className, ...props }: ToastRootProps): ReactNode {
	return (
		<BaseToast.Root
			className={cn(
				"relative border-thin border-border bg-popover pt-2 text-popover-foreground shadow-lg",
				className,
			)}
			{...props}
		/>
	);
}

export function ToastContent({ className, ...props }: ToastContentProps): ReactNode {
	return (
		<BaseToast.Content
			className={cn("flex min-w-0 items-start gap-3 overflow-hidden px-3 pt-2 pb-3", className)}
			{...props}
		/>
	);
}

export function ToastTitle({ className, ...props }: ToastTitleProps): ReactNode {
	return <BaseToast.Title className={cn("font-medium text-sm", className)} {...props} />;
}

export function ToastDescription({ className, ...props }: ToastDescriptionProps): ReactNode {
	return (
		<BaseToast.Description className={cn("text-muted-foreground text-xs", className)} {...props} />
	);
}

export function ToastAction({ className, ...props }: ToastActionProps): ReactNode {
	return (
		<BaseToast.Action
			className={cn(
				"shrink-0 border-thin border-border px-2 py-1 text-xs text-primary hover:bg-accent hover:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

export function ToastClose({ children, className, ...props }: ToastCloseProps): ReactNode {
	return (
		<BaseToast.Close
			aria-label="Dismiss toast"
			className={cn("shrink-0 text-muted-foreground hover:text-foreground", className)}
			{...props}
		>
			{children ?? <XIcon className="size-3.5" />}
		</BaseToast.Close>
	);
}

export function ToastPositioner({ className, ...props }: ToastPositionerProps): ReactNode {
	return <BaseToast.Positioner className={cn("absolute", className)} {...props} />;
}

export function ToastArrow({ className, ...props }: ToastArrowProps): ReactNode {
	return <BaseToast.Arrow className={cn("fill-popover", className)} {...props} />;
}

export function Toaster() {
	const { toasts } = BaseToast.useToastManager();

	return (
		<ToastPortal>
			<ToastViewport>
				{toasts.map((toast) => (
					<ToastRoot key={toast.id} toast={toast}>
						<div className="absolute top-0 left-3 z-raised -translate-y-1/2 border-x-thin border-border bg-popover px-2 text-primary text-tiny leading-none">
							{toast.type?.toUpperCase() ?? "TOAST"}
						</div>
						<ToastContent>
							<div className="min-w-0 flex-1">
								<ToastTitle />
								<ToastDescription />
							</div>
							{toast.actionProps ? <ToastAction {...toast.actionProps} /> : null}
							<ToastClose />
						</ToastContent>
					</ToastRoot>
				))}
			</ToastViewport>
		</ToastPortal>
	);
}

export const useToastManager = BaseToast.useToastManager;
export const createToastManager = BaseToast.createToastManager;
