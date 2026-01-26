import type { SelectRoom } from "$lib/db/schema";
import { writable } from "svelte/store";

export interface PopupsStore {
    showPlDeletePopup: boolean;
    showPlRenamePopup: boolean;
    playlistData?: { name: string; id: string } | null;
    showRoomDeletePopup?: boolean;
    showRoomRenamePopup?: boolean;
    showJoinRoomPopup?: boolean;
    roomData?: SelectRoom | null;

    isPlDeleting?: boolean;
    isPlRenaming?: boolean;
    isRoomDeleting?: boolean;
    isRoomRenaming?: boolean;
}

export const store = writable<PopupsStore>({
    showPlDeletePopup: false,
    showPlRenamePopup: false,
    showRoomDeletePopup: false,
    showRoomRenamePopup: false,
    showJoinRoomPopup: false,

    isPlDeleting: false,
    isPlRenaming: false,
    isRoomDeleting: false,
    isRoomRenaming: false,
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

export function showRoomDeletePopup(roomData: PopupsStore["roomData"]) {
    store.update((s) => ({ ...s, showRoomDeletePopup: true, roomData }));
}

export function hideRoomDeletePopup() {
    store.update((s) => ({ ...s, showRoomDeletePopup: false, roomData: null }));
}

export function showRoomRenamePopup(roomData: PopupsStore["roomData"]) {
    store.update((s) => ({ ...s, showRoomRenamePopup: true, roomData }));
}

export function hideRoomRenamePopup() {
    store.update((s) => ({ ...s, showRoomRenamePopup: false, roomData: null }));
}

export function showJoinRoomPopup(roomData?: PopupsStore["roomData"]) {
    store.update((s) => ({ ...s, showJoinRoomPopup: true, roomData }));
}

export function hideJoinRoomPopup() {
    store.update((s) => ({ ...s, showJoinRoomPopup: false, roomData: null }));
}
