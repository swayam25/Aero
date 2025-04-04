import type { PlayerQueue } from "$lib/queue/types";
import YouTubePlayer from "youtube-player";
import type { SongDetailed } from "ytmusic-api";

export interface PlayerStore {
    player: ReturnType<typeof YouTubePlayer> | null;
    queue: PlayerQueue;
    shuffle: boolean;
    state: "unstarted" | "ended" | "playing" | "paused" | "buffering" | "cued";
    loop: "none" | "single" | "queue";
    meta: SongDetailed | null;
    totalDuration: number;
    currentTime: number;
    showQueue: boolean;
    lyrics: { data: string | null; error: string | null };
    showLyrics: boolean;
}
