import type { RequestHandler } from "./$types";

/**
 * Optimized thumbnail proxy with 302 redirect to reduce server load
 * Redirects directly to YouTube Music CDN URLs instead of proxying the image data
 */
export const GET: RequestHandler = async ({ url }) => {
    try {
        const thumbnailUrl = url.searchParams.get("url");
        if (!thumbnailUrl) {
            return new Response("Missing thumbnail URL", { status: 400 });
        }

        const width = url.searchParams.get("w");
        const height = url.searchParams.get("h");
        const quality = url.searchParams.get("q");

        let modifiedUrl = thumbnailUrl;
        if (width || height) {
            const w = width || "0";
            const h = height || "0";
            const q = quality || "90";
            modifiedUrl = `${thumbnailUrl}=w${w}-h${h}-l${q}-rj`;
        }

        // Instead of proxying, redirect to the YouTube Music CDN
        // This reduces server load significantly while still working around CORB
        return new Response(null, {
            status: 302,
            headers: {
                Location: modifiedUrl,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error redirecting thumbnail:", error);
        return new Response("Internal server error", { status: 500 });
    }
};
