import { writable } from "svelte/store";
import type { SongDetailed } from "ytmusic-api";
import type { CtxStore } from "./types";

export const store = writable<CtxStore>({
    isOpen: false,
    x: 0,
    y: 0,
    type: "song"
});

export function openCtxMenu(e: MouseEvent, song?: SongDetailed, type?: CtxStore["type"]) {
    if (!type) type = "song";
    const x = e.clientX;
    const y = e.clientY;
    store.set({ isOpen: true, x, y, type, song });
}

export function closeCtxMenu() {
    store.set({ isOpen: false, x: 0, y: 0, type: "song" });
}
