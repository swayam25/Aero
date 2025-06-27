import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { access_token, refresh_token, user_token, expires_in } = await request.json();

        cookies.set("access_token", access_token, {
            path: "/",
            maxAge: expires_in,
            sameSite: "lax",
            httpOnly: true
        });

        cookies.set("refresh_token", refresh_token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax",
            httpOnly: true
        });

        cookies.set("user", user_token, {
            path: "/",
            maxAge: expires_in,
            sameSite: "lax",
            httpOnly: true
        });

        return json({ success: true });
    } catch (error) {
        return json({ error }, { status: 500 });
    }
};
