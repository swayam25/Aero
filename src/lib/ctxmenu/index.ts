import { writable } from "svelte/store";
import type { CtxStore } from "./types";

export const store = writable<CtxStore>({
    isOpen: false,
    x: 0,
    y: 0,
    type: "song"
});

export function openCtxMenu(e: MouseEvent, song?: CtxStore["song"], playlistData?: CtxStore["playlistData"], type?: CtxStore["type"]) {
    if (!type) type = "song";
    const x = e.clientX;
    const y = e.clientY;
    store.set({ isOpen: true, x, y, type, song, playlistData });
}

export function closeCtxMenu() {
    store.set({ isOpen: false, x: 0, y: 0, type: "song" });
}
