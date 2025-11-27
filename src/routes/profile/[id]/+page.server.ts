import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { getPublicPlaylists, getUser } from "$lib/db";
import type { UserData } from "$lib/discord/types";
import { fetchUser } from "$lib/discord/user";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    const userId = params.id;
    const userExists = await getUser(locals.db, userId);
    let user: UserData | null;

    if (!userExists) {
        return error(404, "User not found");
    } else if (userId == locals.user?.id) {
        user = locals.user;
    } else {
        const resp = await fetchUser(locals.db, PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, userId);
        if ("error" in resp) {
            return error(404, "User not found");
        }
        user = resp;
    }

    const playlists = await getPublicPlaylists(locals.db, user?.id);

    return { user, playlists };
};
