import { getPlaylists } from "$lib/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ setHeaders, params, locals }) => {
    setHeaders({
        "cache-control": "max-age=6000" // 100 minutes
    });

    if (!locals.user) return redirect(302, "/login");

    const playlists = await getPlaylists(locals.db, locals.user.id);

    return { playlists };
};
