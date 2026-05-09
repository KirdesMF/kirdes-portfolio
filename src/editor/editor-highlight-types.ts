export type EditorHighlightProperties = {
	className?: string;
	href?: string;
	style?: Record<string, string>;
	tabIndex?: number;
};

export type EditorHighlightNode =
	| { type: "text"; value: string }
	| {
			type: "element";
			tagName: "pre" | "code" | "span" | "a";
			properties: EditorHighlightProperties;
			children: Array<EditorHighlightNode>;
	  };
