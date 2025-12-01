import { error, redirect } from "@sveltejs/kit";
import type { SongDetailed } from "ytmusic-api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
    const id = url.searchParams.get("id");

    if (!id) {
        return redirect(302, "/");
    }

    try {
        const song = await locals.ytmusic.getSong(id);
        const upNextsPromise = locals.ytmusic.getUpNexts(id);
        const relatedSongs = upNextsPromise
            .then((upNexts: any[]) => Promise.allSettled(upNexts.map((s: any) => locals.ytmusic.getSong(s.videoId))))
            .then((results) => results.filter((r) => r.status === "fulfilled").map((r: any) => (r as PromiseFulfilledResult<SongDetailed>).value));
        const moreFromArtist = song.artist.artistId
            ? locals.ytmusic.getArtistSongs(song.artist.artistId)
            : locals.ytmusic.searchSongs("Songs by " + song.artist.name);
        return { song, relatedSongs, moreFromArtist };
    } catch (err) {
        console.error("Error fetching song:", err);
        throw error(404, "Song not found");
    }
};
