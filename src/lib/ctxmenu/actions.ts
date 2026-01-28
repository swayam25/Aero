import { goto } from "$app/navigation";
import type { InsertPlaylist, SelectRoomSafe } from "$lib/db/schema";
import { addToQueue, enhanceSong, play, store as playerStore, removeFromQueue, togglePause } from "$lib/player";
import { isRoomHost, joinRoomAPI } from "$lib/room";
import { isJoiningRoom, playlistsCache, showJoinRoomPopup, showPlDeletePopup, showPlRenamePopup } from "$lib/stores";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";
import type { SongDetailed } from "ytmusic-api";
import { createCtxAction, createSubmenuLoader, shortcuts } from "./index";
import type { CtxAction } from "./types";

// Icons
import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
import SolarCopyLinear from "~icons/solar/copy-linear";
import SolarInfoCircleLinear from "~icons/solar/info-circle-linear";
import SolarLoginLinear from "~icons/solar/login-linear";
import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
import SolarNotificationLinesRemoveLinear from "~icons/solar/notification-lines-remove-linear";
import SolarPauseLinear from "~icons/solar/pause-linear";
import SolarPlayLinear from "~icons/solar/play-linear";
import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
import SolarRestartLinear from "~icons/solar/restart-linear";
import SolarShareLinear from "~icons/solar/share-linear";
import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";

// When we `createCtxAction`, in the `onclick` handler first we close the context menu then perform the action.
// This ensures the menu closes before any async operations like network requests or player actions.
// This prevents issues where the menu might still be open when the action completes, which could lead to bad UX.

// Song context menu factory (handles both regular songs and queue songs)
export function createSongActions(song: SongDetailed, loginUserId: string | null | undefined): CtxAction[] {
    const actions: CtxAction[] = [];
    const playerState = get(playerStore);
    const isCurrentlyPlaying = song.videoId === playerState.meta?.videoId;
    const isFromQueue = playerState.queue.some((s) => s.videoId === song.videoId);
    const isRmHost = isRoomHost(loginUserId);

    // Play/Pause/Resume action
    if (isRmHost) {
        if (isCurrentlyPlaying) {
            const isPaused = playerState.state === "paused";
            actions.push(
                createCtxAction({
                    label: isPaused ? "Resume" : "Pause",
                    icon: isPaused ? SolarPlayLinear : SolarPauseLinear,
                    shortcut: shortcuts.space,
                    onclick: async (ctx) => {
                        ctx.closeMenu();
                        await togglePause(loginUserId);
                    },
                }),
            );
        } else {
            actions.push(
                createCtxAction({
                    label: "Play",
                    icon: SolarPlayLinear,
                    shortcut: shortcuts.space,
                    onclick: async (ctx) => {
                        ctx.closeMenu();
                        await play(song, loginUserId, isFromQueue);
                    },
                }),
            );
        }

        // Add to Queue (only if queue exists and song is not currently playing)
        if (playerState.queue.length > 0 && !isCurrentlyPlaying && !isFromQueue) {
            actions.push(
                createCtxAction({
                    label: "Add to Queue",
                    icon: SolarPlaylist2Linear,
                    shortcut: shortcuts.q,
                    onclick: async (ctx) => {
                        ctx.closeMenu();
                        await addToQueue(song, loginUserId);
                        toast.success("Added to queue");
                    },
                }),
            );
        }

        // Remove from Queue (only if from queue and not currently playing)
        if (isFromQueue && !isCurrentlyPlaying) {
            actions.push(
                createCtxAction({
                    label: "Remove from Queue",
                    icon: SolarNotificationLinesRemoveLinear,
                    type: "error",
                    shortcut: shortcuts.delete,
                    onclick: async (ctx) => {
                        ctx.closeMenu();
                        await removeFromQueue(song, loginUserId);
                        toast.success("Removed from queue");
                    },
                }),
            );
        }
    }

    // Add to Playlist (only if logged in)
    if (loginUserId) {
        actions.push(
            createCtxAction({
                label: "Add to Playlist",
                icon: SolarMusicLibraryLinear,
                submenu: createSubmenuLoader(() => loadPlaylistSubmenu(song), {
                    loadingItems: 3,
                    loadingLabel: "Loading playlist",
                    errorLabel: "Failed to load playlists",
                }),
                onclick: async (ctx) => {
                    // This will be handled by submenu, but keep as fallback
                    ctx.closeMenu();
                },
            }),
        );
    }

    // Copy Link
    actions.push(
        createCtxAction({
            label: "Copy Song Link",
            icon: SolarCopyLinear,
            shortcut: shortcuts.ctrl.c,
            onclick: async (ctx) => {
                ctx.closeMenu();
                const link = `${window.location.origin}/song?id=${song.videoId}`;
                navigator.clipboard.writeText(link);
                toast.success("Song link copied to clipboard");
            },
        }),
    );

    // Song Info
    actions.push(
        createCtxAction({
            label: "Song Info",
            icon: SolarInfoCircleLinear,
            shortcut: shortcuts.i,
            onclick: async (ctx) => {
                ctx.closeMenu();
                goto(`/song?id=${song.videoId}`);
            },
        }),
    );

    return actions;
}

// Playlist context menu factory
export function createPlaylistActions(playlistData: { name: string; id: string }, loginUserId: string | null): CtxAction[] {
    const actions: CtxAction[] = [];

    // Share
    actions.push(
        createCtxAction({
            label: "Share Playlist",
            icon: SolarShareLinear,
            shortcut: shortcuts.ctrl.s,
            onclick: async (ctx) => {
                ctx.closeMenu();
                try {
                    const resp = await fetch(`/api/playlist/${playlistData.id}`, {
                        method: "POST",
                        body: JSON.stringify({
                            key: "fetch",
                            value: { playlistID: playlistData.id },
                        }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const plData = await resp.json();
                    if (!resp.ok) {
                        toast.error(plData.error);
                    } else if (plData.isPublic) {
                        const playlistURL = `${window.location.origin}/playlist/${loginUserId}/${playlistData.id}`;
                        navigator.clipboard.writeText(playlistURL);
                        toast.success("Playlist URL copied to clipboard");
                    } else {
                        toast.error("Playlist is private");
                    }
                } catch (error) {
                    toast.error("Failed to share playlist");
                }
            },
        }),
    );

    // Rename
    actions.push(
        createCtxAction({
            label: "Rename Playlist",
            icon: SolarRestartLinear,
            shortcut: shortcuts.f2,
            onclick: async (ctx) => {
                ctx.closeMenu();
                showPlRenamePopup(playlistData);
            },
        }),
    );

    // Delete
    actions.push(
        createCtxAction({
            label: "Delete Playlist",
            icon: SolarTrashBinTrashLinear,
            type: "error",
            shortcut: shortcuts.shift.delete,
            separator: true,
            onclick: async (ctx) => {
                ctx.closeMenu();
                showPlDeletePopup(playlistData);
            },
        }),
    );

    return actions;
}

// Playlist song context menu factory
export function createPlaylistSongActions(
    song: SongDetailed,
    playlistData: { name: string; id: string },
    loginUserId: string | null,
    accessedUserId: string | null,
): CtxAction[] {
    const actions: CtxAction[] = [];
    const isRmHost = isRoomHost(loginUserId);

    if (isRmHost) {
        // Play
        actions.push(
            createCtxAction({
                label: "Play",
                icon: SolarPlayLinear,
                shortcut: shortcuts.space,
                onclick: async (ctx) => {
                    ctx.closeMenu();
                    await play(song, loginUserId);
                },
            }),
        );

        // Add to Queue
        const playerState = get(playerStore);
        if (playerState.queue.length > 0) {
            actions.push(
                createCtxAction({
                    label: "Add to Queue",
                    icon: SolarPlaylist2Linear,
                    shortcut: shortcuts.q,
                    onclick: async (ctx) => {
                        ctx.closeMenu();
                        await addToQueue(song, loginUserId);
                        toast.success("Added to queue");
                    },
                }),
            );
        }
    }

    // Copy Link
    actions.push(
        createCtxAction({
            label: "Copy Song Link",
            icon: SolarCopyLinear,
            shortcut: shortcuts.ctrl.c,
            onclick: async (ctx) => {
                ctx.closeMenu();
                const link = `${window.location.origin}/song?id=${song.videoId}`;
                navigator.clipboard.writeText(link);
                toast.success("Song link copied to clipboard");
            },
        }),
    );

    // Song Info
    actions.push(
        createCtxAction({
            label: "Song Info",
            icon: SolarInfoCircleLinear,
            shortcut: shortcuts.i,
            onclick: async (ctx) => {
                ctx.closeMenu();
                goto(`/song?id=${song.videoId}`);
            },
        }),
    );

    // Remove from Playlist (only if user owns the playlist)
    if (loginUserId && accessedUserId && loginUserId === accessedUserId) {
        actions.push(
            createCtxAction({
                label: "Remove from Playlist",
                icon: SolarTrashBinTrashLinear,
                type: "error",
                shortcut: shortcuts.delete,
                onclick: async (ctx) => {
                    ctx.closeMenu();
                    try {
                        toast.promise(
                            (async () => {
                                const resp = await fetch(`/api/playlist/${playlistData.id}`, {
                                    body: JSON.stringify({
                                        key: "remove_song",
                                        value: {
                                            playlistID: playlistData.id,
                                            songID: song.videoId,
                                        },
                                    }),
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                });
                                const respData = await resp.json();
                                if (!resp.ok) {
                                    throw new Error(respData.error || "Failed to remove song from playlist");
                                }
                                return respData;
                            })(),
                            {
                                loading: "Removing song from playlist...",
                                success: "Removed song from playlist",
                                error(error) {
                                    return String(error) || "Failed to remove song from playlist";
                                },
                            },
                        );
                    } catch (error) {
                        toast.error("Failed to remove song from playlist");
                    }
                },
            }),
        );
    }

    return actions;
}

// Load playlist submenu dynamically with caching
async function loadPlaylistSubmenu(song: SongDetailed): Promise<CtxAction[]> {
    try {
        const cache = get(playlistsCache);
        let playlists: InsertPlaylist[] = [];

        if (cache && !playlistsCache.isStale(cache)) {
            playlists = playlistsCache.getPlaylists(cache);
        } else {
            await playlistsCache.refresh();
            const updatedCache = get(playlistsCache);
            playlists = playlistsCache.getPlaylists(updatedCache);
        }

        if (playlists.length === 0) {
            return [
                createCtxAction({
                    label: "No playlists found",
                    icon: SolarConfoundedCircleLinear,
                    disabled: true,
                    onclick: async () => {},
                }),
            ];
        }

        return playlists.map((playlist) =>
            createCtxAction({
                label: playlist.name,
                image: playlist.cover || undefined,
                onclick: async (ctx) => {
                    ctx.closeMenu();
                    try {
                        const enhanced = enhanceSong(song);
                        toast.promise(
                            (async () => {
                                const resp = await fetch(`/api/playlist/${playlist.id}`, {
                                    body: JSON.stringify({
                                        key: "add_song",
                                        value: {
                                            playlistID: playlist.id,
                                            songID: song.videoId,
                                            songCover: enhanced.thumbnail.FULL,
                                        },
                                    }),
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                });
                                const respData = await resp.json();
                                if (!resp.ok) {
                                    throw new Error(respData.error || "Failed to add song to playlist");
                                }
                                return respData;
                            })(),
                            {
                                loading: "Adding song to playlist...",
                                success: "Added song to playlist",
                                error(error) {
                                    return String(error) || "Failed to add song to playlist";
                                },
                            },
                        );
                    } catch (error) {
                        toast.error("Failed to add song to playlist");
                    }
                },
            }),
        );
    } catch (error) {
        throw new Error("Failed to load playlists");
    }
}

// Room context menu factory
export function createRoomActions(room: SelectRoomSafe, isHost: boolean): CtxAction[] {
    const actions: CtxAction[] = [];

    // Copy Room Link
    actions.push(
        createCtxAction({
            label: "Copy Room Link",
            icon: SolarCopyLinear,
            shortcut: shortcuts.ctrl.c,
            onclick: async (ctx) => {
                ctx.closeMenu();
                const link = `${window.location.origin}/room/${room.id}`;
                navigator.clipboard.writeText(link);
                toast.success("Room link copied to clipboard");
            },
        }),
    );

    // Join Room (non-host users)
    if (!isHost) {
        actions.push(
            createCtxAction({
                label: "Join Room",
                icon: SolarLoginLinear,
                disabled: get(isJoiningRoom),
                onclick: async (ctx) => {
                    ctx.closeMenu();
                    if (room.hasPassword) showJoinRoomPopup(room);
                    else {
                        toast.promise(
                            (async () => {
                                isJoiningRoom.set(true);
                                try {
                                    const resp = await joinRoomAPI(room.id, "");
                                    if ("error" in resp) throw new Error(resp.error || "Failed to join room");
                                    return resp;
                                } finally {
                                    isJoiningRoom.set(false);
                                }
                            })(),
                            {
                                loading: "Joining room...",
                                success: () => {
                                    goto(`/room/${room.id}`, { invalidateAll: true });
                                    return "Joined room successfully";
                                },
                                error: (err) => String(err) || "Failed to join room",
                            },
                        );
                    }
                },
            }),
        );
    }

    return actions;
}
