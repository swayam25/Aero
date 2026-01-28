import { getPlaylists, getUserRoom } from "$lib/db";
import type { InsertPlaylist, SelectRoomSafe } from "$lib/db/schema";
import type { UserData } from "$lib/discord/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user as UserData;
    let userRoom: SelectRoomSafe | null = null;
    let playlists: InsertPlaylist[] = [];

    if (user) {
        userRoom = await getUserRoom(locals.db, user.id);
        playlists = await getPlaylists(locals.db, user.id);
    }

    return { user, userRoom, playlists };
};
