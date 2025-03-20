import { get, writable } from "svelte/store";
import YouTubePlayer from "youtube-player";
import type { PlayerStore } from "./types";

export const store = writable<PlayerStore>({
    player: null,
    queue: [],
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
        if (event.data === 0 && get(store).loop === "single") {
            newPlayer.playVideo();
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
