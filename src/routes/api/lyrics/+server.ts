import { json } from "@sveltejs/kit";

export const GET = async ({ locals, url }) => {
    const user = locals.user;
    const songID = url.searchParams.get("songID");

    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    if (!songID) return json({ error: "Missing songID" }, { status: 400 });

    const lyrics = await locals.ytmusic.getLyrics(decodeURIComponent(songID));
    if (!lyrics) return json({ error: "Lyrics not found" }, { status: 404 });

    return json({ lyrics: lyrics.join("\n") });
};
