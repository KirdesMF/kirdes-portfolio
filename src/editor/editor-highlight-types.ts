export type EditorHighlightProperties = {
	className?: string;
	style?: Record<string, string>;
	tabIndex?: number;
};

export type EditorHighlightNode =
	| { type: "text"; value: string }
	| {
			type: "element";
			tagName: "pre" | "code" | "span";
			properties: EditorHighlightProperties;
			children: Array<EditorHighlightNode>;
	  };
