import type { SelectRoom } from "$lib/db/schema";

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

export async function addToQueueAPI(roomId: string, songId: string): Promise<{ success: true } | { error: string }> {
    return await postToRoom(roomId, "add_to_queue", { songId });
}

export async function removeFromQueueAPI(roomId: string, songId: string): Promise<{ success: true } | { error: string }> {
    return await postToRoom(roomId, "remove_from_queue", { songId });
}

export async function reorderQueueAPI(roomId: string, videoIds: string[]): Promise<{ success: true } | { error: string }> {
    return await postToRoom(roomId, "reorder_queue", { videoIds });
}

export async function toggleRoomVisibilityAPI(roomId: string): Promise<{ success: true; isPublic: boolean } | { error: string }> {
    return await postToRoom<{ isPublic: boolean }>(roomId, "toggle_visibility");
}
