import type { SelectRoom } from "$lib/db/schema";
import { writable } from "svelte/store";

const createUserRoomStore = () => {
    const { subscribe, set, update } = writable<SelectRoom | null>(null);
    return {
        subscribe,
        set: (room: SelectRoom | null) => {
            set(room);
        },
        update: (room: Partial<SelectRoom>) => {
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
