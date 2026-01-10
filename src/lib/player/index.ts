import { addToQueueAPI, isRoomHost, playInRoomAPI, removeFromQueueAPI, sendPlayerRoomEvent, setQueueAPI } from "$lib/room";
import { getThumbnailUrl } from "$lib/stores";
import { get, writable } from "svelte/store";
import YouTubePlayer from "youtube-player";
import type { SongDetailed, SongFull } from "ytmusic-api";
import type { EnhancedSong, PlayerStore } from "./types";

/**
 * Enhances a song with proxied thumbnail URLs
 */
export function enhanceSong(song: SongDetailed | any): EnhancedSong {
    const originalUrl = song.thumbnails?.[0]?.url || "";
    const cleanUrl = originalUrl.replace(/=w\d+-h\d+(-[a-z](\d+)?)*-rj/g, "");

    return {
        ...song,
        album: song.album || null,
        duration: song.duration ?? null,
        thumbnail: {
            SMALL: getThumbnailUrl(cleanUrl, { width: 60, height: 60 }),
            MEDIUM: getThumbnailUrl(cleanUrl, { width: 120, height: 120 }),
            LARGE: getThumbnailUrl(cleanUrl, { width: 240, height: 240 }),
            XLARGE: getThumbnailUrl(cleanUrl, { width: 480, height: 480 }),
            FULL: getThumbnailUrl(cleanUrl, {}),
        },
    };
}

export const store = writable<PlayerStore>({
    player: null,
    queue: [],
    shuffle: false,
    state: "unstarted",
    loop: "none",
    meta: null,
    totalDuration: 0,
    currentTime: 0,
    showQueue: false,
    lyrics: { data: null, error: null },
    showLyrics: false,
});

export function getLocalStorageVolume(): number {
    const vol = localStorage.getItem("volume");
    return vol ? Number(vol) : 100;
}

export function init(userId: string | null | undefined = null) {
    const newPlayer = YouTubePlayer(document.getElementById("player-iframe") || "", { height: "0", width: "0" });
    const savedVolume = getLocalStorageVolume();
    newPlayer.setVolume(savedVolume);

    newPlayer.on("stateChange", async (event) => {
        store.update((state) => {
            const stateMap = {
                "-1": "unstarted",
                0: "ended",
                1: "playing",
                2: "paused",
                3: "buffering",
                5: "cued",
            };
            return { ...state, state: stateMap[event.data as keyof typeof stateMap] as PlayerStore["state"] };
        });
        if (event.data === 0) {
            await skip(userId);
        }
    });
    newPlayer.on("volumeChange", (event: any) => {
        localStorage.setItem("volume", (event.data.volume as number).toString());
    });
    store.update((state) => ({ ...state, player: newPlayer }));
}

async function fetchLyrics() {
    const storeData = get(store);
    if (!storeData.meta?.videoId) {
        store.update((state) => ({ ...state, lyrics: { data: null, error: "Lyrics Not Found" } }));
        return;
    }
    const resp = await fetch("/api/lyrics?songID=" + encodeURIComponent(storeData.meta?.videoId));
    const data = await resp.json();
    if (resp.ok) {
        store.update((state) => ({ ...state, lyrics: { data: data.lyrics, error: null } }));
    } else {
        store.update((state) => ({ ...state, lyrics: { data: null, error: data.error } }));
    }
}

export async function play(song: SongDetailed, userId: string | null | undefined, fromQueue: boolean = false, fromRoom: boolean = false) {
    let { player } = get(store);

    const isRmHost = isRoomHost(userId);
    if (!fromRoom && !isRmHost) {
        if (!player) init(userId);
        return;
    }

    // Enhance song with thumbnails and update player metadata
    const enhancedSong = enhanceSong(song);
    store.update((state) => ({ ...state, meta: enhancedSong }));

    // Initialize player if not already
    if (!player) init(userId);

    player = get(store).player;
    player?.loadVideoById(song.videoId);
    if (!fromQueue) await addToQueue(song, userId);
    player?.playVideo();

    // Continuously update current time and total duration
    const updateTime = async () => {
        const state = get(store).state;
        if (state === "playing") {
            const currentTime = (await player?.getCurrentTime()) || 0;
            const totalDuration = (await player?.getDuration()) || 0;
            store.update((state) => ({ ...state, currentTime, totalDuration }));
        }
        requestAnimationFrame(updateTime);
    };

    if (isRmHost) {
        await playInRoomAPI(enhancedSong);
    }
    sendPlayerRoomEvent(userId, "play", { queue: get(store).queue, nowPlaying: enhancedSong });
    await fetchLyrics();
    updateTime();
}

export async function playPlaylist(song: SongDetailed, plSongs: Promise<SongFull>[], userId: string | null | undefined) {
    const songs = (await Promise.all(plSongs)).map((item) => fetchSongDetailed(item));

    let { player } = get(store);

    // Enhance song with thumbnails and update player metadata
    const enhancedSong = enhanceSong(song);
    store.update((state) => ({ ...state, meta: enhancedSong }));

    // Initialize player if not already
    if (!player) init(userId);

    // Play the given song
    await play(song, userId);

    // Split the playlist into two parts: songs after the given song and songs before it
    const songIndex = songs.findIndex((s) => s.videoId === song.videoId);
    if (songIndex === -1) return; // If the song is not found, exit

    const songsAfter = songs.slice(songIndex + 1);
    const songsBefore = songs.slice(0, songIndex);
    const reorderedPlaylist = [enhancedSong, ...songsAfter, ...songsBefore].map((s) => enhanceSong(s));

    // Update the queue with the reordered playlist
    store.update((state) => ({
        ...state,
        queue: reorderedPlaylist,
    }));

    // Room
    if (isRoomHost(userId)) {
        await setQueueAPI(reorderedPlaylist);
    }
}

export async function addToQueue(song: SongDetailed, userId: string | null | undefined) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    const enhancedSong = enhanceSong(song);

    store.update((state) => {
        // Filter out the song if already in the queue
        state.queue = state.queue.filter((queuedSong) => queuedSong.videoId !== song.videoId);

        // Add the song at the end of the queue
        state.queue.push(enhancedSong);
        return state;
    });

    // Room
    const isRmHost = isRoomHost(userId);
    if (isRmHost) {
        await addToQueueAPI(enhancedSong);
    }
}

export async function removeFromQueue(song: SongDetailed, userId: string | null | undefined) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    store.update((state) => {
        state.queue = state.queue.filter((queuedItem) => queuedItem.videoId !== song.videoId);
        return state;
    });
    if (get(store).queue.length < 2) store.update((state) => ({ ...state, shuffle: false, showQueue: false }));

    // Room
    const isRmHost = isRoomHost(userId);
    if (isRmHost) {
        await removeFromQueueAPI(song.videoId);
    }
}

export function clearQueue() {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    store.update((state) => ({ ...state, queue: [], shuffle: false, showQueue: false }));
}

export async function togglePause(userId: string | null | undefined) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    const state = get(store).state;
    state === "playing" ? player.pauseVideo() : player.playVideo();

    // Room
    if (state === "playing") {
        sendPlayerRoomEvent(userId, "pause");
    } else {
        sendPlayerRoomEvent(userId, "resume");
    }
}

export function stop() {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.stopVideo();
    store.update((state) => ({
        ...state,
        queue: [],
        shuffle: false,
        state: "unstarted",
        loop: "none",
        meta: null,
        totalDuration: 0,
        currentTime: 0,
        showQueue: false,
        lyrics: { data: null, error: null },
        showLyrics: false,
    }));
}

export function setVolume(vol: number) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.setVolume(vol);
}

export async function previous(userId: string | null | undefined, song: EnhancedSong | null = null) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    if (get(store).queue.length <= 1 || get(store).loop === "single") {
        player.seekTo(0, true);
        player.playVideo();
    } else {
        const queue = get(store).queue;
        const currentID = get(store).meta?.videoId; // Current video ID
        if (currentID) {
            const currentIndex = queue.findIndex((item) => item.videoId === currentID); // Current video index
            let prev; // Previous video ID
            if (song) {
                prev = song;
            } else {
                if (get(store).shuffle) {
                    // Shuffle queue if enabled
                    prev = queue[Math.floor(Math.random() * queue.length)];
                } else {
                    // Otherwise, play previous video in queue
                    prev = queue[currentIndex - 1] || queue[queue.length - 1];
                }
            }
            store.update((state) => {
                state.meta = state.queue.find((item) => item.videoId === prev.videoId) || null;
                return state;
            });
            sendPlayerRoomEvent(userId, "previous", { song: prev });
            player.loadVideoById(prev.videoId);
            player.playVideo();
            const isRmHost = isRoomHost(userId);
            if (isRmHost) {
                await playInRoomAPI(prev);
            }
        }
    }
    await fetchLyrics();
}

export async function skip(userId: string | null | undefined, song: EnhancedSong | null = null) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    if (get(store).loop === "single") {
        player.seekTo(0, true);
        player.playVideo();
    } else if (get(store).queue.length >= 2) {
        const queue = get(store).queue;
        const currentID = get(store).meta?.videoId; // Current video ID
        if (currentID) {
            const currentIndex = queue.findIndex((item) => item.videoId === currentID); // Current video index
            let next: EnhancedSong; // Next video ID
            if (song) {
                next = song;
            } else {
                if (get(store).shuffle) {
                    // Shuffle queue if enabled
                    do {
                        next = queue[Math.floor(Math.random() * queue.length)];
                    } while (next.videoId === currentID);
                } else {
                    // Otherwise, play next video in queue
                    next = queue[currentIndex + 1] || queue[0];
                }
            }
            store.update((state) => {
                state.meta = state.queue.find((item) => item.videoId === next.videoId) || null;
                return state;
            });
            if (get(store).loop !== "queue") {
                store.update((state) => {
                    state.queue = state.queue.filter((item) => item.videoId !== currentID);
                    return state;
                });
            }
            sendPlayerRoomEvent(userId, "skip", { song: next });
            player.loadVideoById(next.videoId);
            player.playVideo();
            const isRmHost = isRoomHost(userId);
            if (isRmHost) {
                await playInRoomAPI(next);
            }
        }
    }
    if (get(store).queue.length < 2) store.update((state) => ({ ...state, shuffle: false, showQueue: false }));

    await fetchLyrics();
}

export function setLoop(loop: PlayerStore["loop"], userId: string | null | undefined) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.setLoop(loop === "queue");
    store.update((state) => ({ ...state, loop }));

    // Rooms
    sendPlayerRoomEvent(userId, "loop", { loop: String(loop) });
}

export function setShuffle(shuffle: boolean, userId: string | null | undefined) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    store.update((state) => ({ ...state, shuffle }));

    // Rooms
    sendPlayerRoomEvent(userId, "shuffle", { shuffle: String(shuffle) });
}

export function seekTo(time: number, userId: string | null | undefined) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.seekTo(time, true);

    // Rooms
    sendPlayerRoomEvent(userId, "seek", { time: String(time) });
}

export function toggleQueue() {
    store.update((state) => ({ ...state, showQueue: !state.showQueue, showLyrics: false }));
}

export function toggleLyrics() {
    store.update((state) => ({ ...state, showQueue: false, showLyrics: !state.showLyrics }));
}

export function fetchSongDetailed(song: SongFull): SongDetailed {
    return {
        type: song.type,
        name: song.name,
        videoId: song.videoId,
        artist: song.artist,
        album: { name: "", albumId: "" },
        duration: song.duration,
        thumbnails: song.thumbnails,
    };
}
