import { JWT_SECRET } from "$env/static/private";
import { getUser } from "$lib/db";
import { db } from "$lib/db/db";
import { verifyData } from "$lib/discord/jwt";
import type { CookieUserData } from "$lib/discord/types";
import { init as initPlayer } from "$lib/player";
import { redirect, type Handle, type ServerInit } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { onMount } from "svelte";
import YTMusic from "ytmusic-api";

const handleRefreshHook: Handle = async ({ event, resolve }) => {
    const accessToken: string | undefined = event.cookies.get("access_token");
    const refreshToken: string | undefined = event.cookies.get("refresh_token");

    if (!accessToken && refreshToken && event.url.pathname !== "/auth/refresh") {
        return redirect(307, "/auth/refresh");
    }

    return resolve(event);
};

const setLocalsHook: Handle = async ({ event, resolve }) => {
    const user: string | undefined = event.cookies.get("user");

    if (user) {
        const data = await verifyData<CookieUserData>(user, JWT_SECRET);
        let dbUser = null;
        if (data) {
            dbUser = await getUser(db, data.id);
        }
        event.locals.user = data && dbUser ? { ...data, role: dbUser.role } : null;
    }
    event.locals.db = db;

    return resolve(event);
};

const handleYTMusicAPI: Handle = async ({ event, resolve }) => {
    const ytm = new YTMusic();
    await ytm.initialize();
    event.locals.ytmusic = ytm;

    return resolve(event);
};

export const init: ServerInit = async () => {
    onMount(async () => {
        initPlayer();
    });
};

export const handle = sequence(handleRefreshHook, setLocalsHook, handleYTMusicAPI);
