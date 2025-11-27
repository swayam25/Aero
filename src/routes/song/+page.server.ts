import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
    const id = url.searchParams.get("id");

    if (!id) {
        return redirect(302, "/");
    }

    try {
        const song = await locals.ytmusic.getSong(id);
        const relatedSongs = locals.ytmusic.searchSongs("Related songs to " + song.name + " " + song.artist.name);
        const moreFromArtist = locals.ytmusic.searchSongs("More from " + song.artist.name);
        return { song, relatedSongs, moreFromArtist };
    } catch (err) {
        console.error("Error fetching song:", err);
        throw error(404, "Song not found");
    }
};
