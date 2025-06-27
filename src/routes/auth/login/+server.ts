import { DISCORD_CLIENT_ID } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";
import { json } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const SCOPE = "identify";
    const REDIRECT_URI = `${url.origin}/auth/callback`;
    const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`;
    return json({ url: DISCORD_ENDPOINT });
};
