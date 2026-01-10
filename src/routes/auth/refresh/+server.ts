import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, JWT_SECRET } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { signData } from "$lib/discord/jwt";
import { getNewAccessToken, getUserDataForCookies } from "$lib/discord/user";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, cookies, locals }) => {
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
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });
        cookies.set("refresh_token", newToken.refresh_token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });

        const userData = await getUserDataForCookies(locals.db, newToken.access_token);
        const token = await signData(userData, JWT_SECRET, `${newToken.expires_in}s`);

        cookies.set("user", token, {
            path: "/",
            maxAge: newToken.expires_in,
            sameSite: "none",
            httpOnly: true,
            secure: true,
        });

        console.log("Refreshed token successfully");
    } else {
        console.log("Failed to refresh token");
        cookies.delete("access_token", { path: "/" });
        cookies.delete("refresh_token", { path: "/" });
        cookies.delete("user", { path: "/" });
    }

    return redirect(302, "/");
};
