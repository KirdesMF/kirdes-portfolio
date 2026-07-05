import * as v from "valibot";

export const IdeSearchSchema = v.object({
	about: v.optional(v.literal("open")),
	contact: v.optional(v.literal("open")),
});

export type IdeSearch = v.InferOutput<typeof IdeSearchSchema>;

export function parseIdeSearch(search: Record<string, unknown>): IdeSearch {
	const result = v.safeParse(IdeSearchSchema, search);
	if (!result.success) return {};
	return result.output;
}
