import { get, writable } from "svelte/store";
import YouTubePlayer from "youtube-player";
import type { PlayerStore } from "./types";

export const store = writable<PlayerStore>({
    player: null,
    queue: [],
    shuffle: false,
    state: "unstarted",
    loop: "none",
    meta: null,
    totalDuration: 0,
    currentTime: 0
});

export async function init() {
    const newPlayer = YouTubePlayer(document.getElementById("player-iframe") || "", { height: "0", width: "0" });
    newPlayer.on("stateChange", (event) => {
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
            if (get(store).loop === "single") {
                newPlayer.playVideo();
            } else if (get(store).loop === "queue") {
                const queue = get(store).queue;
                if (queue.length > 0) {
                    const currentID = get(store).meta?.videoId; // Current video ID
                    if (currentID) {
                        const currentIndex = queue.indexOf(currentID); // Current video index
                        let next; // Next video ID
                        if (get(store).shuffle) {
                            // Shuffle queue if enabled
                            next = queue[Math.floor(Math.random() * queue.length)];
                        } else {
                            // Otherwise, play next video in queue
                            next = queue[currentIndex + 1] || queue[0];
                        }
                        newPlayer.loadVideoById(next);
                        newPlayer.playVideo();
                        store.update((state) => ({ ...state, queue }));
                    }
                }
            }
        }
    });
    newPlayer.on("volumeChange", (event) => {
        store.update((state) => ({ ...state, volume: event.detail }));
    });
    store.update((state) => ({ ...state, player: newPlayer }));
}

export async function play(videoID: string, meta: PlayerStore["meta"]) {
    let { player } = get(store);

    // Update player metadata
    store.update((state) => ({ ...state, meta }));

    // Initialize player if not already
    if (!player) await init();

    player = get(store).player;
    player?.loadVideoById(videoID);
    store.update((state) => {
        state.queue.push(videoID);
        return state;
    });
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
    updateTime();
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

    if (get(store).queue.length <= 0) {
        player.seekTo(0, true);
        player.playVideo();
    }
}

export async function skip() {
    const player = get(store).player;
    if (!player) return { error: "No player instance" };

    if (get(store).loop === "single") {
        player.seekTo(0, true);
        player.playVideo();
    }
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
