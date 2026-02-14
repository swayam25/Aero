import { addSongToPlaylist, getPlaylist, removeSongFromPlaylist, reorderPlaylist, setPlaylistCover, toggleView } from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    let playlistExists = await getPlaylist(locals.db, user?.id, value.playlistID);
    if (!playlistExists) {
        return json({ error: "Playlist not found" }, { status: 404 });
    } else {
        if (playlistExists.userId !== user?.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    if (key === "add_song") {
        await addSongToPlaylist(locals.db, value.playlistID, value.songID);
        await setPlaylistCover(locals.db, value.playlistID, value.songCover);
    } else if (key === "remove_song") {
        await removeSongFromPlaylist(locals.db, value.playlistID, value.songID);
        const lastSongID = playlistExists.songs.slice(-1)[0] === value.songID ? playlistExists.songs.slice(-2)[0] : null;
        if (lastSongID) {
            const song = await locals.ytmusic.getSong(lastSongID);
            await setPlaylistCover(locals.db, value.playlistID, song.thumbnails?.[0]?.url);
        }
    } else if (key === "toggle_view") {
        const isPublic = await toggleView(locals.db, value.playlistID);
        return json({ success: true, isPublic });
    } else if (key === "fetch") {
        return json(playlistExists);
    } else if (key === "reorder") {
        await reorderPlaylist(locals.db, value.playlistID, value.songIDs);
        const song = await locals.ytmusic.getSong(value.songIDs.slice(-1)[0]);
        await setPlaylistCover(locals.db, value.playlistID, song.thumbnails?.[0]?.url);
    }

    return json({ success: true });
};
