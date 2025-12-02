import { createRoom, deleteRoom, renameRoom } from "$lib/db";
import supabaseChannel from "$lib/supabase/channel";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    if (key === "create_room") {
        const room = await createRoom(locals.db, value.name.substring(0, 20).trim(), value.password || "", user, value.isPublic);
        return json({ success: true, room });
    } else if (key === "rename_room") {
        await renameRoom(locals.db, value.roomID, value.name.substring(0, 20).trim());
    } else if (key === "host_disconnect") {
        await supabaseChannel(`room:${value.roomID}-events`).httpSend(key, {});
        await deleteRoom(locals.db, value.roomID);
    }

    return json({ success: true });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { id } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    await deleteRoom(locals.db, id);

    return json({ success: true });
};
