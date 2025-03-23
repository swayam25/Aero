import { writable } from "svelte/store";
import type { CtxStore } from "./types";

export const store = writable<CtxStore>({
    isOpen: false,
    showPlaylistMenu: false,
    x: 0,
    y: 0,
    type: "song",
    loginUserID: null
});

export function openCtxMenu(
    e: MouseEvent,
    loginUserID: CtxStore["loginUserID"],
    song?: CtxStore["song"],
    playlistData?: CtxStore["playlistData"],
    type?: CtxStore["type"],
    accessedUserID?: CtxStore["accessedUserID"]
) {
    if (!type) type = "song";
    const x = e.clientX;
    const y = e.clientY;
    store.set({ isOpen: true, showPlaylistMenu: false, x, y, type, song, playlistData, loginUserID, accessedUserID });
}

export function closeCtxMenu() {
    store.set({
        isOpen: false,
        showPlaylistMenu: false,
        x: 0,
        y: 0,
        type: "song",
        song: null,
        playlistData: null,
        loginUserID: null,
        accessedUserID: null
    });
}
