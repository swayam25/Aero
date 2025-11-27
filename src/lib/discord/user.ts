import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { getUser, type DB } from "$lib/db";
import { error } from "@sveltejs/kit";
import type { UserData } from "./types";

export async function getNewAccessToken(url: string, refreshToken: string, clienID: string, clientSecret: string) {
    const resp = await fetch(`${url}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: clienID,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }).toString(),
    });

    if (resp.ok) {
        return await resp.json();
    } else {
        return null;
    }
}

export async function getUserData(db: DB, access_token: string): Promise<UserData> {
    const userDataResponse = await fetch(`${PUBLIC_DISCORD_URL}/users/@me`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    if (!userDataResponse.ok) {
        error(userDataResponse.status, userDataResponse.statusText);
    }

    let userData: UserData = await userDataResponse.json();
    const dbUser = await getUser(db, userData.id);
    userData.role = dbUser?.role || "user";

    userData = {
        ...userData,
        url: {
            avatar: userData.avatar
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`
                : `https://cdn.discordapp.com/embed/avatars/${(BigInt(userData.id) >> 22n) % 6n}`,
            avatarDecoration: userData.avatar_decoration_data?.asset
                ? `https://cdn.discordapp.com/avatar-decoration-presets/${userData.avatar_decoration_data.asset}`
                : null,
            banner: userData.banner ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}` : null,
        },
    };
    return userData;
}

export async function fetchUser(db: DB, baseURI: string, botToken: string, id: string) {
    const resp = await fetch(`${baseURI}/users/${id}`, {
        headers: {
            Authorization: `Bot ${botToken}`,
        },
    });
    if (!resp.ok) {
        return { error: true };
    }

    let userData: UserData = await resp.json();
    const dbUser = await getUser(db, userData.id);
    userData.role = dbUser?.role || "user";

    userData = {
        ...userData,
        url: {
            avatar: userData.avatar
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`
                : `https://cdn.discordapp.com/embed/avatars/${(BigInt(userData.id) >> 22n) % 6n}`,
            avatarDecoration: userData.avatar_decoration_data?.asset
                ? `https://cdn.discordapp.com/avatar-decoration-presets/${userData.avatar_decoration_data.asset}`
                : null,
            banner: userData.banner ? `https://cdn.discordapp.com/banners/${userData.id}/${userData.banner}` : null,
        },
    };
    return userData;
}
