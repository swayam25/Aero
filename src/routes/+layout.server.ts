import type { UserData } from "$lib/discord/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
    const user = locals.user as UserData;

    return { user };
};
