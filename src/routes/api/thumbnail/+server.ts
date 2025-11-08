import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, fetch, setHeaders }) => {
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
        const response = await fetch(modifiedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        if (!response.ok) {
            return new Response("Failed to fetch thumbnail", { status: response.status });
        }
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "image/jpeg";

        // Set headers to prevent CORB issues
        setHeaders({
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
            "Cross-Origin-Resource-Policy": "cross-origin",
        });

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
