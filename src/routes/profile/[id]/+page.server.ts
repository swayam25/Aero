import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { checkUser } from "$lib/db";
import type { UserData } from "$lib/discord/types";
import { fetchUser } from "$lib/discord/user";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ setHeaders, params, locals }) => {
    setHeaders({
        "cache-control": "max-age=6000" // 100 minutes
    });

    const userID = params.id;
    const userExists = await checkUser(locals.db, userID);
    let user: UserData;

    if (!userExists) {
        return error(404, "User not found");
    } else if (userID == locals.user?.id) {
        user = locals.user;
    } else {
        const resp = await fetchUser(PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, userID);
        if ("error" in resp) {
            return error(404, "User not found");
        }
        user = resp;
    }

    return { user };
};
