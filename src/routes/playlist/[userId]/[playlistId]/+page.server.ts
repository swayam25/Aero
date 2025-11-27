import { DISCORD_BOT_TOKEN } from "$env/static/private";
import { PUBLIC_DISCORD_URL } from "$env/static/public";
import { getPlaylist, getUser } from "$lib/db";
import type { SelectPlaylist } from "$lib/db/schema";
import type { UserData } from "$lib/discord/types";
import { fetchUser } from "$lib/discord/user";
import { error } from "@sveltejs/kit";
import type { SongFull } from "ytmusic-api";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
    const userId = params.userId;
    const playlistId = String(params.playlistId);

    const userExists = await getUser(locals.db, userId);
    let loginUser: UserData | null = locals.user;
    let user: UserData | null;
    let playlist: SelectPlaylist;
    let playlistSongs: Promise<SongFull>[];

    if (!userExists) {
        return error(404, "User not found");
    } else {
        if (userId == locals.user?.id) {
            user = locals.user;
        } else {
            const resp = await fetchUser(locals.db, PUBLIC_DISCORD_URL, DISCORD_BOT_TOKEN, userId);
            if ("error" in resp) {
                return error(404, "User not found");
            }
            user = resp;
        }

        if (!playlistId) return error(404, "Playlist not found");
        const playlistExists = await getPlaylist(locals.db, userId, playlistId);
        if (!playlistExists) {
            return error(404, "Playlist not found");
        } else {
            playlist = playlistExists;
            if (!playlist.isPublic && loginUser?.id !== user?.id) return error(404, "Playlist not found");
            playlistSongs = [];
            playlist.songs.forEach(async (song) => {
                playlistSongs.push(locals.ytmusic.getSong(song));
            });
        }
    }

    return { loginUser, user, playlist, playlistSongs };
};
