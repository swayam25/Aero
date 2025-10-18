import YouTubePlayer from "youtube-player";
import type { SongDetailed } from "ytmusic-api";

export interface EnhancedThumbnails {
    SMALL: string; // 60x60 - Player, queue items
    MEDIUM: string; // 120x120 - Search results
    LARGE: string; // 240x240 - Song pages
    XLARGE: string; // 480x480 - Mobile player
    FULL: string; // Original size
}

export interface EnhancedSong extends SongDetailed {
    thumbnail: EnhancedThumbnails;
}

export interface PlayerStore {
    player: ReturnType<typeof YouTubePlayer> | null;
    queue: EnhancedSong[];
    shuffle: boolean;
    state: "unstarted" | "ended" | "playing" | "paused" | "buffering" | "cued";
    loop: "none" | "single" | "queue";
    meta: EnhancedSong | null;
    totalDuration: number;
    currentTime: number;
    showQueue: boolean;
    lyrics: { data: string | null; error: string | null };
    showLyrics: boolean;
}
