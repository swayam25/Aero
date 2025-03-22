import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { checkPlaylist, checkUser } from "$lib/db";
import type { SelectPlaylist } from "$lib/db/schema";
import type { UserData } from "$lib/discord/types";
import { fetchUser } from "$lib/discord/user";
import { error } from "@sveltejs/kit";
import type { SongFull } from "ytmusic-api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ setHeaders, params, locals }) => {
    setHeaders({
        "cache-control": "max-age=6000" // 100 minutes
    });

    const userID = params.userID;
    const playlistID = Number(params.playlistID);

    const userExists = await checkUser(locals.db, userID);
    let user: UserData;
    let playlist: SelectPlaylist;
    let playlistSongs: Promise<SongFull>[];

    if (!userExists) {
        return error(404, "User not found");
    } else {
        if (userID == locals.user?.id) {
            user = locals.user;
        } else {
            const resp = await fetchUser(PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, userID);
            if ("error" in resp) {
                return error(404, "User not found");
            }
            user = resp;
        }

        if (!playlistID) return error(404, "Playlist not found");
        const playlistExists = await checkPlaylist(locals.db, userID, playlistID);
        if (!playlistExists) {
            return error(404, "Playlist not found");
        } else {
            playlist = playlistExists;
            playlistSongs = [];
            playlist.songs.forEach(async (song) => {
                playlistSongs.push(locals.ytmusic.getSong(song));
            });
        }
    }

    return { user, playlist, playlistSongs };
};
