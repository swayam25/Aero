import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { error } from "@sveltejs/kit";
import type { UserData } from "./types";
import type { APIUser } from "discord-api-types/v10";

export async function getNewAccessToken(url: string, refreshToken: string, clienID: string, clientSecret: string) {
    const resp = await fetch(`${url}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
            client_id: clienID,
            client_secret: clientSecret,
            grant_type: "refresh_token",
            refresh_token: refreshToken
        }).toString()
    });

    if (resp.ok) {
        return await resp.json();
    } else {
        return null;
    }
}

export async function getUserData(access_token: string): Promise<UserData> {
    const userDataResponse = await fetch(`${PUBLIC_DISCORD_URL}/users/@me`, {
        headers: {
            Authorization: `Bearer ${access_token}`
        }
    });
    if (!userDataResponse.ok) {
        error(userDataResponse.status, userDataResponse.statusText);
    }
    const userData: UserData = await userDataResponse.json();
    return userData;
}

export async function fetchUser(baseURI: string, botToken: string, id: string) {
    const resp = await fetch(`${baseURI}/users/${id}`, {
        headers: {
            Authorization: `Bot ${botToken}`
        }
    });
    if (!resp.ok) {
        return { error: true };
    }
    return (await resp.json()) as APIUser;
}
