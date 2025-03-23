import { getPlaylists } from "$lib/db";
import type { InsertPlaylist } from "$lib/db/schema";
import type { UserData } from "$lib/discord/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user as UserData;

    let playlists: InsertPlaylist[] = [];
    if (user) {
        playlists = await getPlaylists(locals.db, user.id);
    }

    return { user, playlists };
};
