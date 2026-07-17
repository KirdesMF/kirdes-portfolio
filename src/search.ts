import * as v from "valibot";

const AppSearchSchema = v.object({
	contact: v.optional(v.literal("open")),
});

type AppSearch = v.InferOutput<typeof AppSearchSchema>;

export function parseAppSearch(search: Record<string, unknown>): AppSearch {
	const result = v.safeParse(AppSearchSchema, search);
	if (!result.success) return {};
	return result.output;
}
