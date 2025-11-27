import { getRooms, getUserRoom } from "$lib/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) return redirect(302, "/");

    let rooms = await getRooms(locals.db);
    let userRoom = await getUserRoom(locals.db, locals.user.id);

    if (userRoom) return redirect(302, `/room/${userRoom.id}`);

    return { rooms };
};
