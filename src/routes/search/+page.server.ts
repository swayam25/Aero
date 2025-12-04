import type { SongDetailed } from "ytmusic-api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
    const search = url.searchParams.get("q") as string;

    let songs: Promise<SongDetailed[]> | null = null;
    if (search) {
        songs = locals.ytmusic.searchSongs(search);
    }
    return { songs };
};
