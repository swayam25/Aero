import type { SongDetailed } from "ytmusic-api";

export interface CtxStore {
    isOpen: boolean;
    x: number;
    y: number;
    type: "song" | "playlist";
    song?: SongDetailed; // Only defined if type === "song"
}
