import { writable } from "svelte/store";

interface SongsCacheData {
    categories: Record<string, any>;
    currentOffset: number;
    hasMore: boolean;
    lastUpdated: number;
}

const createSongsCache = () => {
    const { subscribe, set, update } = writable<SongsCacheData | null>(null);

    return {
        subscribe,
        setCache: (data: SongsCacheData) => set(data),
        updateCache: (categories: Record<string, any>, offset: number, hasMore: boolean) => {
            update((cache) => {
                if (!cache) {
                    return {
                        categories,
                        currentOffset: offset,
                        hasMore,
                        lastUpdated: Date.now(),
                    };
                }
                return {
                    ...cache,
                    categories: { ...cache.categories, ...categories },
                    currentOffset: offset,
                    hasMore,
                    lastUpdated: Date.now(),
                };
            });
        },
        clearCache: () => set(null),
        isStale: (cache: SongsCacheData | null, maxAge = 5 * 60 * 1000) => {
            // 5 minutes
            if (!cache) return true;
            return Date.now() - cache.lastUpdated > maxAge;
        },
    };
};

export const songsCache = createSongsCache();
