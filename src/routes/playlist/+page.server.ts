import { getPlaylists } from "$lib/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) return redirect(302, "/auth/login");

    let playlists = await getPlaylists(locals.db, locals.user.id);

    return { playlists };
};
