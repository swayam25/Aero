import { addSongToPlaylist, createPlaylist, setPlaylistCover, type DB } from "$lib/db";
import { getSpotifyPlaylist } from "$lib/services/spotify";
import type { Track } from "@spotify/web-api-ts-sdk";
import { json, type RequestHandler } from "@sveltejs/kit";
import type YTMusic from "ytmusic-api";

interface ImportResult {
    success: boolean;
    message?: string;
    error?: string;
    totalSongs: number;
    importedSongs: number;
    unmatchedSongs: number;
}

interface PlaylistTrack {
    name: string;
    artist: string;
    videoId?: string;
}

async function fetchSpotifyPlaylist(playlistID: string): Promise<{ name: string; tracks: PlaylistTrack[] } | null> {
    try {
        const pl = await getSpotifyPlaylist(playlistID);
        if (!pl || pl.tracks.total <= 0) {
            return null;
        }

        const tracks: PlaylistTrack[] = [];
        for (const track of pl.tracks.items) {
            if (!track.track || track.track.type !== "track") {
                continue;
            }
            const spotifyTrack = track.track as Track;
            tracks.push({
                name: spotifyTrack.name,
                artist: spotifyTrack.artists.map((a) => a.name).join(" "),
            });
        }
        return { name: pl.name, tracks };
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function fetchYTMusicPlaylist(playlistID: string, ytmusic: YTMusic): Promise<{ name: string; tracks: PlaylistTrack[] } | null> {
    try {
        const pl = await ytmusic.getPlaylist(playlistID);
        if (!pl || pl.videoCount === 0) {
            return null;
        }

        // Fetch detailed playlist with songs
        const detailedPl = await ytmusic.getPlaylistVideos(playlistID);
        if (!detailedPl || detailedPl.length === 0) {
            return null;
        }

        const tracks: PlaylistTrack[] = detailedPl.map((track: any) => ({
            name: track.name || track.title || "",
            artist: track.artist?.name || "",
            videoId: track.videoId,
        }));

        return { name: pl.name, tracks };
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function searchYTMusicSong(trackName: string, artistName: string, ytmusic: YTMusic): Promise<string | null> {
    const query = `${trackName} ${artistName}`;
    const search = await ytmusic.searchSongs(query);
    if (search.length > 0) {
        return search[0].videoId;
    }
    return null;
}

async function importPlaylistFromSource(source: string, playlistID: string, userId: string, db: DB, ytmusic: YTMusic): Promise<ImportResult> {
    let playlistData: { name: string; tracks: PlaylistTrack[] } | null = null;

    if (source === "spotify") {
        playlistData = await fetchSpotifyPlaylist(playlistID);
    } else if (source === "ytmusic") {
        playlistData = await fetchYTMusicPlaylist(playlistID, ytmusic);
    } else {
        return {
            success: false,
            error: "Unsupported source",
            totalSongs: 0,
            importedSongs: 0,
            unmatchedSongs: 0,
        };
    }

    if (!playlistData) {
        return {
            success: false,
            error: "Playlist not found or empty",
            totalSongs: 0,
            importedSongs: 0,
            unmatchedSongs: 0,
        };
    }

    const playlistName = playlistData.name.substring(0, 20).trim();
    const createdPl = await createPlaylist(db, userId, playlistName);
    const playlistDbId = createdPl.id as string;

    let unmatchedSongs = 0;
    let importedSongs = 0;
    let lastVideoId: string | null = null;

    for (const track of playlistData.tracks) {
        let videoId: string | null = track.videoId || null;

        if (!videoId) {
            videoId = await searchYTMusicSong(track.name, track.artist, ytmusic);
        }

        if (!videoId) {
            unmatchedSongs++;
        } else {
            await addSongToPlaylist(db, playlistDbId, videoId);
            lastVideoId = videoId;
            importedSongs++;
        }
    }

    if (lastVideoId) {
        const song = await ytmusic.getSong(lastVideoId);
        if (song && song.thumbnails && song.thumbnails.length > 0) {
            await setPlaylistCover(db, playlistDbId, song.thumbnails[0].url.replace("=w60-h60-l90-rj", ""));
        }
    }

    return {
        success: true,
        message: `Imported ${importedSongs} out of ${playlistData.tracks.length} songs`,
        totalSongs: playlistData.tracks.length,
        importedSongs,
        unmatchedSongs,
    };
}

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;

    if (!user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { source, playlistID } = body;

    if (!source || !playlistID) {
        return json({ error: "Missing required parameters: source and playlistID" }, { status: 400 });
    }

    const result = await importPlaylistFromSource(source, playlistID, user.id, locals.db, locals.ytmusic);

    if (result.success) {
        return json({
            success: true,
            message: result.message,
            totalSongs: result.totalSongs,
            importedSongs: result.importedSongs,
            unmatchedSongs: result.unmatchedSongs,
        });
    } else {
        return json({ error: result.error }, { status: 404 });
    }
};
