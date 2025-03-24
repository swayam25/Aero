import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, JWT_SECRET } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { addUser, checkUser } from "$lib/db";
import { signData } from "$lib/discord/jwt";
import { getUserData } from "$lib/discord/user";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ fetch, url, cookies, locals }) => {
    const code = url.searchParams.get("code");
    if (!code) {
        error(400, "No code provided");
    }

    try {
        const resp = await fetch(`${PUBLIC_DISCORD_URL}/oauth2/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: `${url.origin}/auth/callback`
            }).toString()
        });

        if (resp.ok) {
            const { access_token, refresh_token, expires_in } = await resp.json();

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

            const userData = await getUserData(locals.db, access_token);
            const token = await signData(userData, JWT_SECRET, `${expires_in}s`);

            if (userData) {
                cookies.set("user", token, {
                    path: "/",
                    maxAge: expires_in,
                    sameSite: "lax",
                    httpOnly: true
                });

                const dbUser = await checkUser(locals.db, userData.id);
                if (!dbUser) {
                    await addUser(locals.db, userData.id);
                }

                return new Response("Returning to homepage", {
                    status: 302,
                    headers: {
                        Location: "/"
                    }
                });
            } else {
                error(500, "Failed to get user data");
            }
        } else {
            error(resp.status, await resp.text());
        }
    } catch {
        error(500, "Failed to get tokens");
    }
};
