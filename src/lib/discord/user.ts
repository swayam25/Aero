import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { fetchSettings, type DB } from "$lib/db";
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

    const ownerIDs = (await fetchSettings(db, "ownerIDs"))?.value || [];
    const devIDs = (await fetchSettings(db, "devIDs"))?.value || [];

    let userData: UserData = await userDataResponse.json();
    if (ownerIDs.includes(userData.id)) {
        userData = { ...userData, owner: true };
    } else if (devIDs.includes(userData.id)) {
        userData = { ...userData, dev: true };
    }
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

    const ownerIDs = (await fetchSettings(db, "ownerIDs"))?.value || [];
    const devIDs = (await fetchSettings(db, "devIDs"))?.value || [];

    let userData: UserData = await resp.json();
    if (ownerIDs.includes(userData.id)) {
        userData = { ...userData, owner: true };
    } else if (devIDs.includes(userData.id)) {
        userData = { ...userData, dev: true };
    }
    return userData;
}
