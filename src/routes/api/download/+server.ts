import { YOUTUBE_DL_PATH } from "$env/static/private";
import { json } from "@sveltejs/kit";
import yt from "youtube-dl-exec";

export const GET = async ({ locals, url }) => {
    const user = locals.user;
    if (!user) {
        return json({ error: "Login to download songs" }, { status: 401 });
    }

    const id = url.searchParams.get("id");
    if (!id) {
        return json({ error: "Missing id" }, { status: 400 });
    }

    const song = await locals.ytmusic.getSong(decodeURIComponent(id));
    if (!song || !song.videoId) {
        return json({ error: "Song not found" }, { status: 404 });
    }

    if (!YOUTUBE_DL_PATH) {
        throw new Error("YOUTUBE_DL_PATH is not set");
    }

    try {
        const ytdl = yt.create(YOUTUBE_DL_PATH);
        const result = await ytdl(`https://youtube.com/watch?v=${song.videoId}`, {
            format: "ba[ext=m4a]/ba",
            getUrl: true,
            skipDownload: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addMetadata: true,
        });

        const downloadURL = typeof result === "string" ? String(result).trim() : Array.isArray(result) ? result[0].trim() : null;
        if (!downloadURL) {
            return json({ error: "Failed to get download URL" }, { status: 500 });
        }
        const response = await fetch(downloadURL);
        if (!response.ok) {
            return json({ error: "Failed to fetch audio stream" }, { status: 500 });
        }

        const safeName = (song.name || "audio").replace(/[/\\?%*:|"<>]/g, "-");
        const encodedFilename = encodeURIComponent(safeName);

        return new Response(response.body, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "audio/mp4",
                "Content-Disposition": `attachment; filename="audio.m4a"; filename*=UTF-8''${encodedFilename}.m4a`,
            },
        });
    } catch (err) {
        console.error("Error fetching song info:", err);
        return json({ error: "Failed to fetch song info" }, { status: 500 });
    }
};
