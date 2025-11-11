import { addSongToPlaylist, checkPlaylist, removeSongFromPlaylist, reorderPlaylist, setPlaylistCover, toggleView } from "$lib/db";
import { enhanceSong } from "$lib/player";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    let playlistExists = await checkPlaylist(locals.db, user?.id, value.playlistID);
    if (!playlistExists) {
        return json({ error: "Playlist not found" }, { status: 404 });
    } else {
        if (playlistExists.userID !== user?.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    if (key === "add_song") {
        await addSongToPlaylist(locals.db, value.playlistID, value.songID);
        await setPlaylistCover(locals.db, value.playlistID, value.songCover);
    } else if (key === "remove_song") {
        const currentIndex = playlistExists.songs.indexOf(value.songID);
        const previousSongID = currentIndex > 0 ? playlistExists.songs[currentIndex - 1] : playlistExists.songs[currentIndex + 1];
        await setPlaylistCover(
            locals.db,
            value.playlistID,
            previousSongID ? enhanceSong(await locals.ytmusic.getSong(previousSongID)).thumbnail.FULL : "",
        );
        await removeSongFromPlaylist(locals.db, value.playlistID, value.songID);
    } else if (key === "toggle_view") {
        const isPublic = await toggleView(locals.db, value.playlistID);
        return json({ success: true, isPublic });
    } else if (key === "fetch") {
        return json(playlistExists);
    } else if (key === "reorder") {
        await reorderPlaylist(locals.db, value.playlistID, value.songIDs);
        await setPlaylistCover(locals.db, value.playlistID, enhanceSong(await locals.ytmusic.getSong(value.songIDs.slice(-1)[0])).thumbnail.FULL);
    }

    return json({ success: true });
};
