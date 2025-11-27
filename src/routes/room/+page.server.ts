import { getRooms } from "$lib/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) return redirect(302, "/");

    let rooms = await getRooms(locals.db);

    for (const room of rooms) {
        if (room.hostUserId === locals.user?.id || room.members.some((member) => member.id === locals.user?.id)) {
            return redirect(302, `/room/${room.id}`);
        }
    }

    return { rooms };
};
