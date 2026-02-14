import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, fetch }) => {
    try {
        const thumbnailUrl = url.searchParams.get("url");
        if (!thumbnailUrl) {
            return new Response("Missing thumbnail URL", { status: 400 });
        }

        // Fetch the image from YouTube with proper headers
        const response = await fetch(thumbnailUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        if (!response.ok) {
            return new Response("Failed to fetch thumbnail", { status: response.status });
        }

        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";

        // Return the image with proper headers
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Access-Control-Allow-Origin": "*",
                "Cross-Origin-Resource-Policy": "cross-origin",
            },
        });
    } catch (error) {
        console.error("Error proxying thumbnail:", error);
        return new Response("Internal server error", { status: 500 });
    }
};
