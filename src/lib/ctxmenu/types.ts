import type { SongDetailed } from "ytmusic-api";

export interface CtxStore {
    isOpen: boolean;
    x: number;
    y: number;
    type: "song" | "queue" | "playlist";
    song?: SongDetailed | null; // Only defined if type === "song"
    playlistData?: { name: string; id: number } | null; // Only defined if type === "playlist"
}
