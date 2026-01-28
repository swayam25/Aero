import type { SelectRoomSafe } from "$lib/db/schema";
import { writable } from "svelte/store";

const createUserRoomStore = () => {
    const { subscribe, set, update } = writable<SelectRoomSafe | null>(null);
    return {
        subscribe,
        set: (room: SelectRoomSafe | null) => {
            set(room);
        },
        update: (room: Partial<SelectRoomSafe>) => {
            update((currentRoom) => {
                if (!currentRoom) return currentRoom;
                return { ...currentRoom, ...room };
            });
        },
        clear: () => {
            set(null);
        },
    };
};

export const userRoomStore = createUserRoomStore();
