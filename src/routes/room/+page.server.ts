import { getRooms, getUser } from "$lib/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) return redirect(302, "/");

    let rooms = await getRooms(locals.db);
    let user = await getUser(locals.db, locals.user.id);

    if (user?.hostedRooms[0]) return redirect(302, `/room/${user.hostedRooms[0].id}`);
    if (user?.joinedRooms[0]) return redirect(302, `/room/${user.joinedRooms[0].roomId}`);

    return { rooms };
};
