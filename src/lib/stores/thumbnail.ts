import { writable } from "svelte/store";

/**
 * Thumbnail size presets for common use cases
 */
export const THUMBNAIL_SIZES = {
    SMALL: { width: 60, height: 60 }, // Player, queue items
    MEDIUM: { width: 120, height: 120 }, // Search results
    LARGE: { width: 240, height: 240 }, // Song page thumbnails
    XLARGE: { width: 480, height: 480 }, // Mobile player
    FULL: { width: undefined, height: undefined }, // Original size
} as const;

export type ThumbnailSize = keyof typeof THUMBNAIL_SIZES;

interface ThumbnailOptions {
    width?: number;
    height?: number;
    quality?: number;
}

/**
 * Generates a proxied thumbnail URL to prevent CORB issues
 * @param originalUrl - The original YouTube Music thumbnail URL
 * @param options - Optional width, height, and quality parameters
 * @returns Proxied thumbnail URL through our API
 */
export function getThumbnailUrl(originalUrl: string, options: ThumbnailOptions = {}): string {
    if (!originalUrl) return "";
    const cleanUrl = originalUrl.replace(/=w\d+-h\d+-l\d+-rj/g, "");
    const params = new URLSearchParams();
    params.set("url", cleanUrl);
    if (options.width) params.set("w", options.width.toString());
    if (options.height) params.set("h", options.height.toString());
    if (options.quality) params.set("q", options.quality.toString());
    return `/api/thumbnail?${params.toString()}`;
}

/**
 * Gets a thumbnail URL with a predefined size preset
 * @param originalUrl - The original YouTube Music thumbnail URL
 * @param size - Predefined size preset
 * @returns Proxied thumbnail URL through our API
 */
export function getThumbnailUrlWithSize(originalUrl: string, size: ThumbnailSize = "MEDIUM"): string {
    const { width, height } = THUMBNAIL_SIZES[size];
    return getThumbnailUrl(originalUrl, { width, height });
}

/**
 * Helper to get thumbnail from song objects
 * @param thumbnails - Array of thumbnail objects from ytmusic-api
 * @param options - Optional width, height, and quality parameters
 * @returns Proxied thumbnail URL
 */
export function getSongThumbnail(thumbnails: Array<{ url: string }> | undefined, options: ThumbnailOptions = {}): string {
    if (!thumbnails || thumbnails.length === 0) return "";
    return getThumbnailUrl(thumbnails[0].url, options);
}

/**
 * Helper to get thumbnail from song objects with size preset
 * @param thumbnails - Array of thumbnail objects from ytmusic-api
 * @param size - Predefined size preset
 * @returns Proxied thumbnail URL
 */
export function getSongThumbnailWithSize(thumbnails: Array<{ url: string }> | undefined, size: ThumbnailSize = "MEDIUM"): string {
    if (!thumbnails || thumbnails.length === 0) return "";
    return getThumbnailUrlWithSize(thumbnails[0].url, size);
}

/**
 * Store for managing thumbnail cache and settings
 */
interface ThumbnailStore {
    defaultQuality: number;
    cacheEnabled: boolean;
}

const createThumbnailStore = () => {
    const { subscribe, set, update } = writable<ThumbnailStore>({
        defaultQuality: 90,
        cacheEnabled: true,
    });
    return {
        subscribe,
        setDefaultQuality: (quality: number) => {
            update((state) => ({ ...state, defaultQuality: quality }));
        },
        toggleCache: () => {
            update((state) => ({ ...state, cacheEnabled: !state.cacheEnabled }));
        },
    };
};

export const thumbnailStore = createThumbnailStore();
