import { addSongToPlaylist, checkPlaylist, removeSongFromPlaylist, toggleView } from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    let playlistExists = await checkPlaylist(locals.db, user.id, value.playlistID);
    if (!playlistExists) {
        return json({ error: "Playlist not found" }, { status: 404 });
    } else {
        if (playlistExists.userID !== user.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    if (key === "add_song") {
        await addSongToPlaylist(locals.db, value.playlistID, value.songID);
    } else if (key === "remove_song") {
        await removeSongFromPlaylist(locals.db, value.playlistID, value.songID);
    } else if (key === "toggle_view") {
        const isPublic = await toggleView(locals.db, value.playlistID);
        return json({ success: true, isPublic });
    }

    return json({ success: true });
};
