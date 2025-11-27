import { getRoom } from "$lib/db";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.user) return redirect(302, "/");

    let room = null;

    try {
        room = await getRoom(locals.db, String(params.id));
    } catch {
        return error(404, "Room not found");
    }

    if (!room) {
        return error(404, "Room not found");
    }

    return { room };
};
