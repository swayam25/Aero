import { json } from "@sveltejs/kit";

export const GET = async ({ locals, url }) => {
    const search = url.searchParams.get("q") || "";
    const sugg = await locals.ytmusic.getSearchSuggestions(decodeURIComponent(search));
    return json(sugg);
};
