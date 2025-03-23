import { get, writable } from "svelte/store";
import type { CtxStore } from "./types";

export const store = writable<CtxStore>({
    isOpen: false,
    showPlaylistMenu: false,
    x: 0,
    y: 0,
    type: "song"
});

export function openCtxMenu(
    e: MouseEvent,
    song?: CtxStore["song"],
    playlistData?: CtxStore["playlistData"],
    type?: CtxStore["type"],
    loginUserID?: CtxStore["loginUserID"],
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
        playlistData: get(store).preservePlaylistData ? get(store).playlistData : null,
        loginUserID: null,
        accessedUserID: null
    });
}
