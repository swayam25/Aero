import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const songs = {
        "Trending Songs": locals.ytmusic.searchSongs("Trending Songs"),
        "Popular Songs": locals.ytmusic.searchSongs("Popular Songs"),
        "Global Hits": locals.ytmusic.searchSongs("Global Hits")
    };

    return { songs };
};
