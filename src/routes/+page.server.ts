import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
    setHeaders({
        "cache-control": "max-age=6000" // 100 minutes
    });

    const songs = {
        "Trending Songs": locals.ytmusic.searchSongs("Trending Songs"),
        "Popular Songs": locals.ytmusic.searchSongs("Popular Songs"),
        "Global Hits": locals.ytmusic.searchSongs("Global Hits")
    };

    return { songs };
};
