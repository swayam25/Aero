import { getPlaylists, getUser } from "$lib/db";
import type { InsertPlaylist, SelectUserWithRooms } from "$lib/db/schema";
import type { UserData } from "$lib/discord/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user as UserData;
    let dbUser: SelectUserWithRooms | undefined = undefined;
    let playlists: InsertPlaylist[] = [];

    if (user) {
        dbUser = await getUser(locals.db, user.id);
        playlists = await getPlaylists(locals.db, user.id);
    }

    return { user, dbUser, playlists };
};
