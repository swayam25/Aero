import type { SongDetailed } from "ytmusic-api";

export type PlayerQueue = {
    id: number;
    song: SongDetailed;
}[];
