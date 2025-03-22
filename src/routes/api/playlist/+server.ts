import { createPlaylist, deletePlaylist, editPlaylist } from "$lib/db";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { key, value } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    if (key === "create_pl") {
        await createPlaylist(locals.db, user.id, value);
    } else if (key === "edit_pl") {
        await editPlaylist(locals.db, value.playlistID, value.name);
    }

    return json({ success: true });
};

export const DELETE: RequestHandler = async ({ locals, request }) => {
    const user = locals.user;
    const body = await request.json();
    const { id } = body;

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    await deletePlaylist(locals.db, id);

    return json({ success: true });
};
