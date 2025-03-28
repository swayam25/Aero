import type { SongDetailed } from "ytmusic-api";

export interface CtxStore {
    isOpen: boolean;
    showPlaylistMenu: boolean;
    x: number;
    y: number;
    type: "song" | "queue" | "playlist" | "playlistSong";
    loginUserID: string | null | undefined;
    song?: SongDetailed | null; // Only defined if type === "song" or "playlistSong"
    playlistData?: { name: string; id: number } | null; // Only defined if type === "playlist" or "playlistSong"
    accessedUserID?: string | null;
}
