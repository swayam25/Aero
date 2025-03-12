import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, JWT_SECRET } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { signData } from "$lib/discord/jwt";
import { getNewAccessToken, getUserData } from "$lib/discord/user";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ cookies, locals }) => {
    const refreshToken: string | undefined = cookies.get("refresh_token");

    if (!refreshToken) {
        return redirect(302, "/");
    }

    console.log("No access token found, refreshing token...");
    const newToken = await getNewAccessToken(PUBLIC_DISCORD_URL, refreshToken, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET);

    if (newToken) {
        cookies.set("access_token", newToken.access_token, {
            path: "/",
            maxAge: newToken.expires_in,
            sameSite: "lax",
            httpOnly: true
        });
        cookies.set("refresh_token", newToken.refresh_token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "lax",
            httpOnly: true
        });

        const userData = await getUserData(newToken.access_token);
        const token = await signData(userData, JWT_SECRET, `${newToken.expires_in}s`);

        cookies.set("user", token, {
            path: "/",
            maxAge: newToken.expires_in,
            sameSite: "lax",
            httpOnly: true
        });

        console.log("Refreshed token successfully");
    }

    return redirect(302, "/");
};
