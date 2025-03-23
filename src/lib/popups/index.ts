import { store as ctxStore } from "$lib/ctxmenu";
import { writable } from "svelte/store";
import type { PopupsStore } from "./types";

export const store = writable<PopupsStore>({
    showPlDeletePopup: false,
    showPlRenamePopup: false
});

export function showPlDeletePopup() {
    ctxStore.update((s) => ({ ...s, preservePlaylistData: true }));
    store.update((s) => ({ ...s, showPlDeletePopup: true }));
}

export function hidePlDeletePopup() {
    ctxStore.update((s) => ({ ...s, preservePlaylistData: false }));
    store.update((s) => ({ ...s, showPlDeletePopup: false }));
}

export function showPlRenamePopup() {
    store.update((s) => ({ ...s, showPlRenamePopup: true }));
}

export function hidePlRenamePopup() {
    store.update((s) => ({ ...s, showPlRenamePopup: false }));
}
