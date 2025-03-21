import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
    const search = url.searchParams.get("q") as string;

    const songs = locals.ytmusic.searchSongs(search);
    return { songs };
};
