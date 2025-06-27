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
            const userData = await getUserData(locals.db, access_token);
            const userToken = await signData(userData, JWT_SECRET, `${expires_in}s`);

            if (userData) {
                const dbUser = await checkUser(locals.db, userData.id);
                if (!dbUser) {
                    await addUser(locals.db, userData.id);
                }

                return new Response(
                    `
                    <!DOCTYPE html>
                    <html>
                    <head><title>Login Successful</title></head>
                    <body>
                        <script>
                            const tokens = {
                                access_token: ${JSON.stringify(access_token)},
                                refresh_token: ${JSON.stringify(refresh_token)},
                                user_token: ${JSON.stringify(userToken)},
                                expires_in: ${expires_in}
                            };

                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'LOGIN_SUCCESS',
                                    tokens: tokens
                                }, window.location.origin);
                                window.close();
                            } else if (window.parent && window.parent !== window) {
                                window.parent.postMessage({
                                    type: 'LOGIN_SUCCESS',
                                    tokens: tokens
                                }, window.location.origin);
                            } else {
                                window.location.href = '/';
                            }
                        </script>
                        <p>Login successful! This window will close automatically...</p>
                    </body>
                    </html>
                    `,
                    {
                        headers: { "Content-Type": "text/html" }
                    }
                );
            } else {
                error(500, "Failed to get user data");
            }
        } else {
            error(resp.status, await resp.text());
        }
    } catch (e) {
        console.error(e);
        error(500, "Failed to get tokens");
    }
};
