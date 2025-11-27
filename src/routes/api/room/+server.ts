import { createRoom, deleteRoom, renameRoom } from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    if (key === "create_room") {
        await createRoom(locals.db, value.name.substring(0, 20).trim(), value.password, user, value.isPublic);
    } else if (key === "rename_room") {
        await renameRoom(locals.db, value.roomID, value.name.substring(0, 20).trim());
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
