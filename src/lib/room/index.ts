import type { SelectRoom } from "$lib/db/schema";
import type { EnhancedSong } from "$lib/player/types";
import { userRoomStore } from "$lib/stores/userRoom";
import supabaseChannel from "$lib/supabase/channel";
import { get } from "svelte/store";

type APIResult<T = unknown> = { success: true } & T;

// --- ROOT ---

async function postRoot<T = any>(key: string, value: Object = {}): Promise<APIResult<T> | { error: string }> {
    const resp = await fetch(`/api/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
    });
    const respData = await resp.json();
    if (resp.ok) return respData as APIResult<T>;
    return { error: respData.error || "An error occurred" };
}

export async function createRoomAPI(
    name: string,
    password: string = "",
    isPublic: boolean = true,
): Promise<{ success: true; room: SelectRoom } | { error: string }> {
    return await postRoot<{ room: SelectRoom }>("create_room", { name, password, isPublic });
}

export async function renameRoomAPI(roomId: string, name: string): Promise<{ success: true } | { error: string }> {
    return await postRoot("rename_room", { roomID: roomId, name });
}

export async function deleteRoomAPI(roomId: string): Promise<{ success: true } | { error: string }> {
    const resp = await fetch(`/api/room`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId }),
    });
    const respData = await resp.json();
    if (resp.ok) return respData as { success: true };
    return { error: respData.error || "An error occurred" };
}

// --- ROOM SPECIFIC ---

export async function fetchRoomAPI(roomId: string): Promise<SelectRoom | { error: string }> {
    const resp = await fetch(`/api/room/${roomId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const respData = await resp.json();
    if (resp.ok) {
        if (respData.room) {
            return respData.room as SelectRoom;
        } else {
            return { error: "Room not found" };
        }
    } else {
        return { error: respData.error || "An error occurred" };
    }
}

async function postToRoom<T = any>(roomId: string, key: string, value: Object = {}): Promise<APIResult<T> | { error: string }> {
    const resp = await fetch(`/api/room/${roomId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
    });
    const respData = await resp.json();
    if (resp.ok) {
        return respData as APIResult<T>;
    } else {
        return { error: respData.error || "An error occurred" };
    }
}

export async function joinRoomAPI(roomId: string, password?: string): Promise<{ success: true } | { error: string }> {
    return await postToRoom(roomId, "join", { password: password || "" });
}

export async function leaveRoomAPI(roomId: string): Promise<{ success: true } | { error: string }> {
    return await postToRoom(roomId, "leave");
}

export async function playInRoomAPI(song: EnhancedSong): Promise<{ success: true } | { error: string }> {
    const roomId = get(userRoomStore)?.id;
    if (!roomId) return { error: "User is not in a room" };
    return await postToRoom(roomId, "play", { song });
}

export async function addToQueueAPI(song: EnhancedSong): Promise<{ success: true } | { error: string }> {
    const roomId = get(userRoomStore)?.id;
    if (!roomId) return { error: "User is not in a room" };
    return await postToRoom(roomId, "add_to_queue", { song });
}

export async function removeFromQueueAPI(songId: string): Promise<{ success: true } | { error: string }> {
    const roomId = get(userRoomStore)?.id;
    if (!roomId) return { error: "User is not in a room" };
    return await postToRoom(roomId, "remove_from_queue", { songId });
}

export async function setQueueAPI(songs: EnhancedSong[]): Promise<{ success: true } | { error: string }> {
    const roomId = get(userRoomStore)?.id;
    if (!roomId) return { error: "User is not in a room" };
    return await postToRoom(roomId, "set_queue", { songs });
}

export async function toggleRoomVisibilityAPI(roomId: string): Promise<{ success: true; isPublic: boolean } | { error: string }> {
    return await postToRoom<{ isPublic: boolean }>(roomId, "toggle_visibility");
}

export function isRoomHost(userId: string | null | undefined): boolean {
    const userRoom = get(userRoomStore);
    if (userRoom && userId) {
        return userRoom.hostUserId === userId;
    } else {
        return true;
    }
}

export function sendPlayerRoomEvent(userId: string | null | undefined, event: string, payload: Object = {}): void {
    const room = get(userRoomStore);
    const isRmHost = isRoomHost(userId);
    if (room && isRmHost) {
        const roomChannel = supabaseChannel(`room:${room.id}-player-events`);
        roomChannel.httpSend(event, payload);
    }
}
