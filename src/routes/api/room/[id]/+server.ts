import { addRoomMember, addSongToQueue, getRoom, removeRoomMember, removeSongFromQueue, reorderQueue, toggleRoomVisibility } from "$lib/db";
import type { SelectRoom } from "$lib/db/schema";
import { enhanceSong } from "$lib/player";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request, params }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });
    if (!params.id) return json({ error: "Room ID is required" }, { status: 400 });

    let roomExists;
    try {
        roomExists = await getRoom(locals.db, params.id);
    } catch {
        return json({ error: "Room not found" }, { status: 404 });
    }
    if (!roomExists) {
        return json({ error: "Room not found" }, { status: 404 });
    }

    // Members
    if (key === "join") {
        const password = value.password || "";
        if (!user.id) return json({ error: "Invalid user id" }, { status: 400 });
        if (roomExists.hostUserId === user?.id) {
            return json({ error: "Room hosts cannot be added as members" }, { status: 401 });
        } else if (roomExists.password !== password) {
            return json({ error: "Incorrect room password" }, { status: 401 });
        } else {
            await addRoomMember(locals.db, params.id, user);
        }
    } else if (key === "leave") {
        if (!user.id) return json({ error: "Invalid user id" }, { status: 400 });
        if (roomExists.hostUserId === user?.id) {
            return json({ error: "Room hosts cannot be removed" }, { status: 401 });
        } else {
            await removeRoomMember(locals.db, params.id, user);
        }
    }

    // Queue
    else if (key === "add_to_queue") {
        if (!roomExists.members.some((member) => member.id === user?.id) && roomExists.hostUserId !== user?.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
        const song = await locals.ytmusic.getSong(value.songID);
        if (!song) return json({ error: "Song not found" }, { status: 404 });
        const enhanced = enhanceSong(song);
        await addSongToQueue(locals.db, params.id, enhanced);
    } else if (key === "remove_from_queue") {
        if (!roomExists.members.some((member) => member.id === user?.id) && roomExists.hostUserId !== user?.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
        await removeSongFromQueue(locals.db, params.id, value.songID);
    } else if (key === "reorder_queue") {
        if (roomExists.hostUserId !== user?.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
        await reorderQueue(locals.db, params.id, value.videoIds);
    }

    // Others
    else if (key === "toggle_visibility") {
        if (roomExists.hostUserId !== user?.id) {
            return json({ error: "Unauthorized" }, { status: 401 });
        }
        const isPublic = await toggleRoomVisibility(locals.db, params.id);
        return json({ success: true, isPublic });
    }

    return json({ success: true });
};

export const GET: RequestHandler = async ({ locals, params }) => {
    const user = locals.user;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });
    if (!params.id) return json({ error: "Room ID is required" }, { status: 400 });

    let room;
    try {
        room = await getRoom(locals.db, params.id);
    } catch {
        return json({ error: "Room not found" }, { status: 404 });
    }
    if (!room) {
        return json({ error: "Room not found" }, { status: 404 });
    }

    if (!room.members.some((member) => member.id === user?.id) && room.hostUserId !== user?.id) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const { members, ...roomWithoutMembers } = room;
    return json({ success: true, room: roomWithoutMembers as SelectRoom });
};
