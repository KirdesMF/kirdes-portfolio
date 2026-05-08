export type EditorHighlightNode =
	| { type: "text"; value: string }
	| {
			type: "element";
			tagName: "pre" | "code" | "span";
			properties: {
				className?: string;
				style?: Record<string, string>;
				tabIndex?: number;
			};
			children: Array<EditorHighlightNode>;
	  };
