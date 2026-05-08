export const terminalDialogNames = ["music"] as const;

export type TerminalDialogName = (typeof terminalDialogNames)[number];
