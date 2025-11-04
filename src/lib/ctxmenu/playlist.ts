import type { InsertPlaylist } from "$lib/db/schema";
import { playlistsCache } from "$lib/stores";

// Preload playlists cache in the background for instant access
export async function preloadPlaylistsCache(): Promise<void> {
    try {
        const resp = await fetch(`/api/playlists`);
        const playlists = (await resp.json()) as InsertPlaylist[];
        playlistsCache.setCache(playlists);
    } catch (error) {
        console.error("Failed to preload playlists cache:", error);
    }
}

// Refresh playlists cache (call this when a playlist is created/deleted/renamed)
export async function refreshPlaylistsCache(): Promise<void> {
    try {
        const resp = await fetch(`/api/playlists`);
        const playlists = (await resp.json()) as InsertPlaylist[];
        playlistsCache.updateCache(playlists);
    } catch (error) {
        console.error("Failed to refresh playlists cache:", error);
    }
}
