import * as v from "valibot";

export const IdeSearchSchema = v.object({
	file: v.optional(v.string()),
	neotree: v.optional(v.union([v.literal("open"), v.literal("closed")])),
});

export type IdeSearch = v.InferOutput<typeof IdeSearchSchema>;

export function parseIdeSearch(search: Record<string, unknown>): IdeSearch {
	const result = v.safeParse(IdeSearchSchema, search);
	if (!result.success) return {};
	return {
		...result.output,
		neotree: result.output.neotree ?? "closed",
	};
}
