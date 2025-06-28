import { writable } from "svelte/store";

export interface PopupsStore {
    showPlDeletePopup: boolean;
    showPlRenamePopup: boolean;
    playlistData?: { name: string; id: string } | null;
}

export const store = writable<PopupsStore>({
    showPlDeletePopup: false,
    showPlRenamePopup: false
});

export function showPlDeletePopup(playlistData: PopupsStore["playlistData"]) {
    store.update((s) => ({ ...s, showPlDeletePopup: true, playlistData }));
}

export function hidePlDeletePopup() {
    store.update((s) => ({ ...s, showPlDeletePopup: false, playlistData: null }));
}

export function showPlRenamePopup(playlistData: PopupsStore["playlistData"]) {
    store.update((s) => ({ ...s, showPlRenamePopup: true, playlistData }));
}

export function hidePlRenamePopup() {
    store.update((s) => ({ ...s, showPlRenamePopup: false, playlistData: null }));
}
