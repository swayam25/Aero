import { DISCORD_CLIENT_ID } from "$env/static/private";
import type { RequestHandler } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    const SCOPE = "identify";
    const DISCORD_ENDPOINT = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${url.origin}/auth/callback`)}&response_type=code&scope=${SCOPE}`;
    return redirect(302, DISCORD_ENDPOINT);
};
