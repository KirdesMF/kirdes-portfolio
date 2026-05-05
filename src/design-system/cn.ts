type ClassNameValue = string | false | null | undefined;

export function cn(...classNames: Array<ClassNameValue>): string {
	return classNames.filter(Boolean).join(" ");
}
