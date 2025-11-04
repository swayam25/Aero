import type { InsertPlaylist } from "$lib/db/schema";
import { writable } from "svelte/store";

interface PlaylistsCacheData {
    playlists: InsertPlaylist[];
    lastUpdated: number;
}

const createPlaylistsCache = () => {
    const { subscribe, set, update } = writable<PlaylistsCacheData | null>(null);

    return {
        subscribe,
        setCache: (playlists: InsertPlaylist[]) => {
            set({
                playlists,
                lastUpdated: Date.now(),
            });
        },
        updateCache: (playlists: InsertPlaylist[]) => {
            update((cache) => {
                return {
                    playlists,
                    lastUpdated: Date.now(),
                };
            });
        },
        addPlaylist: (playlist: InsertPlaylist) => {
            update((cache) => {
                if (!cache) {
                    return {
                        playlists: [playlist],
                        lastUpdated: Date.now(),
                    };
                }
                return {
                    playlists: [playlist, ...cache.playlists],
                    lastUpdated: Date.now(),
                };
            });
        },
        removePlaylist: (playlistId: string) => {
            update((cache) => {
                if (!cache) return null;
                return {
                    playlists: cache.playlists.filter((p) => p.id !== playlistId),
                    lastUpdated: Date.now(),
                };
            });
        },
        updatePlaylist: (playlistId: string, updates: Partial<InsertPlaylist>) => {
            update((cache) => {
                if (!cache) return null;
                return {
                    playlists: cache.playlists.map((p) => (p.id === playlistId ? { ...p, ...updates } : p)),
                    lastUpdated: Date.now(),
                };
            });
        },
        clearCache: () => set(null),
        isStale: (cache: PlaylistsCacheData | null, maxAge = 60 * 1000) => {
            // 1 min
            if (!cache) return true;
            return Date.now() - cache.lastUpdated > maxAge;
        },
        getPlaylists: (cache: PlaylistsCacheData | null) => {
            return cache?.playlists || [];
        },
    };
};

export const playlistsCache = createPlaylistsCache();
