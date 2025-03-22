import { getPlaylists } from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
    const user = locals.user;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    const playlists = await getPlaylists(locals.db, user?.id);

    return json(playlists);
};
