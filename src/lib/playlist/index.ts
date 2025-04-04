import type { SongFull, SongDetailed } from "ytmusic-api";

export function fetchSongDetailed(song: SongFull): SongDetailed {
    return {
        type: song.type,
        name: song.name,
        videoId: song.videoId,
        artist: song.artist,
        album: { name: "", albumId: "" },
        duration: song.duration,
        thumbnails: song.thumbnails
    };
}
