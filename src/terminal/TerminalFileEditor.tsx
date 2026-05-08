import { X } from "lucide-react";
import { findTerminalFile } from "./terminal-files";

function addLineNumbers(content: string): Array<{ lineNumber: number; value: string }> {
	return content.split("\n").map((value, index) => ({ lineNumber: index + 1, value }));
}

export function TerminalFileEditor({
	fileName,
	onClose,
}: {
	fileName: string;
	onClose: () => void;
}) {
	const file = findTerminalFile(fileName);

	if (file === null) {
		return (
			<section className="flex h-full min-h-0 flex-col border-border text-xs">
				<div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
					<span className="text-muted-foreground">file not found</span>
					<button
						className="text-muted-foreground hover:text-foreground"
						type="button"
						onClick={onClose}
					>
						<X className="size-3.5" />
					</button>
				</div>
				<div className="p-3 text-muted-foreground">unable to open {fileName}</div>
			</section>
		);
	}

	return (
		<section className="flex h-full min-h-0 flex-col border-border text-xs">
			<div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
				<div className="flex min-w-0 items-center gap-2">
					<span className="truncate text-foreground">{file.name}</span>
					<span className="text-muted-foreground/60">{file.language}</span>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<span className="text-muted-foreground/70">read-only</span>
					<button
						className="text-muted-foreground hover:text-foreground"
						type="button"
						onClick={onClose}
					>
						<X className="size-3.5" />
					</button>
				</div>
			</div>
			<pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
				{addLineNumbers(file.content).map(({ lineNumber, value }) => (
					<div className="flex gap-4" key={`${file.name}-${lineNumber}`}>
						<span className="w-6 shrink-0 select-none text-right text-muted-foreground/50">
							{lineNumber}
						</span>
						<code className="whitespace-pre text-foreground/90">{value || " "}</code>
					</div>
				))}
			</pre>
		</section>
	);
}
