import YouTubePlayer from "youtube-player";
import type { SongDetailed } from "ytmusic-api";

export interface PlayerStore {
    player: ReturnType<typeof YouTubePlayer> | null;
    queue: string[];
    shuffle: boolean;
    state: "unstarted" | "ended" | "playing" | "paused" | "buffering" | "cued";
    loop: "none" | "single" | "queue";
    meta: SongDetailed | null;
    totalDuration: number;
    currentTime: number;
}
