import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "$env/static/private";
import type { Playlist } from "@spotify/web-api-ts-sdk";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export function createSpotifyClient(): SpotifyApi {
    return SpotifyApi.withClientCredentials(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET);
}

export async function getSpotifyPlaylist(playlistID: string): Promise<Playlist> {
    const spotify = createSpotifyClient();
    const playlist = await spotify.playlists.getPlaylist(playlistID);
    return playlist;
}
