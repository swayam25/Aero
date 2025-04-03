import { get, writable } from "svelte/store";
import YouTubePlayer from "youtube-player";
import type { SongDetailed } from "ytmusic-api";
import type { PlayerStore } from "./types";

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
    showLyrics: false
});

export async function init() {
    const newPlayer = YouTubePlayer(document.getElementById("player-iframe") || "", { height: "0", width: "0" });
    newPlayer.on("stateChange", async (event) => {
        store.update((state) => {
            const stateMap = {
                "-1": "unstarted",
                0: "ended",
                1: "playing",
                2: "paused",
                3: "buffering",
                5: "cued"
            };
            return { ...state, state: stateMap[event.data as keyof typeof stateMap] as PlayerStore["state"] };
        });
        if (event.data === 0) {
            await skip();
        }
    });
    newPlayer.on("volumeChange", (event) => {
        store.update((state) => ({ ...state, volume: event.detail }));
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

export async function play(song: SongDetailed, fromQueue: boolean = false) {
    let { player } = get(store);

    // Update player metadata
    store.update((state) => ({ ...state, meta: song }));

    // Initialize player if not already
    if (!player) await init();

    player = get(store).player;
    player?.loadVideoById(song.videoId);
    if (!fromQueue) await addToQueue(song);
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
    await fetchLyrics();
    updateTime();
}

export async function playPlaylist(song: SongDetailed, songs: SongDetailed[]) {
    let { player } = get(store);

    // Update player metadata
    store.update((state) => ({ ...state, meta: song }));

    // Initialize player if not already
    if (!player) await init();

    // Play the given song
    await play(song);

    // Split the playlist into two parts: songs after the given song and songs before it
    const songIndex = songs.findIndex((s) => s.videoId === song.videoId);
    if (songIndex === -1) return; // If the song is not found, exit

    const songsAfter = songs.slice(songIndex + 1);
    const songsBefore = songs.slice(0, songIndex);
    const reorderedPlaylist = [song, ...songsAfter, ...songsBefore];
    console.log(reorderedPlaylist);

    // Update the queue with the reordered playlist
    store.update((state) => ({ ...state, queue: reorderedPlaylist }));
}

export async function addToQueue(song: SongDetailed) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    store.update((state) => {
        // Filter out the song if already in the queue
        state.queue = state.queue.filter((queuedSong) => queuedSong.videoId !== song.videoId);

        // Add the song at the end of the queue
        state.queue.push(song);
        return state;
    });
}

export async function removeFromQueue(song: SongDetailed) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    store.update((state) => {
        state.queue = state.queue.filter((queuedSong) => queuedSong.videoId !== song.videoId);
        return state;
    });
    if (get(store).queue.length < 2) store.update((state) => ({ ...state, shuffle: false, showQueue: false }));
}

export async function togglePause() {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    const state = get(store).state;
    state === "playing" ? player.pauseVideo() : player.playVideo();
}

export async function setVolume(vol: number) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.setVolume(vol);
}

export async function previous() {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    if (get(store).queue.length <= 1 || get(store).loop === "single") {
        player.seekTo(0, true);
        player.playVideo();
    } else {
        const queue = get(store).queue;
        const currentID = get(store).meta?.videoId; // Current video ID
        if (currentID) {
            const currentIndex = queue.findIndex((song) => song.videoId === currentID); // Current video index
            let prev; // Previous video ID
            if (get(store).shuffle) {
                // Shuffle queue if enabled
                prev = queue[Math.floor(Math.random() * queue.length)];
            } else {
                // Otherwise, play previous video in queue
                prev = queue[currentIndex - 1] || queue[queue.length - 1];
            }
            store.update((state) => {
                state.meta = state.queue.find((song) => song.videoId === prev.videoId) || null;
                return state;
            });
            player.loadVideoById(prev);
            player.playVideo();
        }
    }
    await fetchLyrics();
}

export async function skip() {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    if (get(store).loop === "single") {
        player.seekTo(0, true);
        player.playVideo();
    } else if (get(store).queue.length >= 2) {
        const queue = get(store).queue;
        const currentID = get(store).meta?.videoId; // Current video ID
        if (currentID) {
            const currentIndex = queue.findIndex((song) => song.videoId === currentID); // Current video index
            let next; // Next video ID
            if (get(store).shuffle) {
                // Shuffle queue if enabled
                do {
                    next = queue[Math.floor(Math.random() * queue.length)];
                } while (next.videoId === currentID);
            } else {
                // Otherwise, play next video in queue
                next = queue[currentIndex + 1] || queue[0];
            }
            store.update((state) => {
                state.meta = state.queue.find((song) => song.videoId === next.videoId) || null;
                return state;
            });
            if (get(store).loop !== "queue") {
                store.update((state) => {
                    state.queue = state.queue.filter((song) => song.videoId !== currentID);
                    return state;
                });
            }
            player.loadVideoById(next);
            player.playVideo();
        }
    }
    if (get(store).queue.length < 2) store.update((state) => ({ ...state, shuffle: false, showQueue: false }));
    await fetchLyrics();
}

export async function setLoop(loop: PlayerStore["loop"]) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.setLoop(loop === "queue");
    store.update((state) => ({ ...state, loop }));
}

export async function seekTo(time: number) {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    player.seekTo(time, true);
}

export async function toggleQueue() {
    store.update((state) => ({ ...state, showQueue: !state.showQueue, showLyrics: false }));
}

export async function toggleLyrics() {
    store.update((state) => ({ ...state, showQueue: false, showLyrics: !state.showLyrics }));
}
