import { invalidateAll } from "$app/navigation";
import type { InsertPlaylist } from "$lib/db/schema";
import { addToQueue, play, store as playerStore, removeFromQueue, togglePause } from "$lib/player";
import { showPlDeletePopup, showPlRenamePopup } from "$lib/stores/popups";
import { toast } from "svelte-sonner";
import { get } from "svelte/store";
import type { SongDetailed } from "ytmusic-api";
import { createCtxAction, createSubmenuLoader, shortcuts } from "./index";
import type { CtxAction } from "./types";

// Icons
import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
import SolarCopyLinear from "~icons/solar/copy-linear";
import SolarInfoCircleLinear from "~icons/solar/info-circle-linear";
import SolarMusicLibraryLinear from "~icons/solar/music-library-linear";
import SolarNotificationLinesRemoveLinear from "~icons/solar/notification-lines-remove-linear";
import SolarPauseLinear from "~icons/solar/pause-linear";
import SolarPlayLinear from "~icons/solar/play-linear";
import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
import SolarRestartLinear from "~icons/solar/restart-linear";
import SolarShareLinear from "~icons/solar/share-linear";
import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";

// Song context menu factory
export function createSongActions(song: SongDetailed, loginUserID: string | null): CtxAction[] {
    const actions: CtxAction[] = [];

    // Play action
    actions.push(
        createCtxAction({
            label: "Play",
            icon: SolarPlayLinear,
            shortcut: shortcuts.space,
            onclick: async (ctx) => {
                await play(song);
                ctx.closeMenu();
            }
        })
    );

    // Add to Queue (only if queue exists)
    const playerState = get(playerStore);
    if (playerState.queue.length > 0) {
        actions.push(
            createCtxAction({
                label: "Add to Queue",
                icon: SolarPlaylist2Linear,
                shortcut: shortcuts.q,
                onclick: async (ctx) => {
                    await addToQueue(song);
                    toast.success("Added to queue");
                    ctx.closeMenu();
                }
            })
        );
    }

    // Add to Playlist (only if logged in)
    if (loginUserID) {
        actions.push(
            createCtxAction({
                label: "Add to Playlist",
                icon: SolarMusicLibraryLinear,
                submenu: createSubmenuLoader(() => loadPlaylistSubmenu(song), {
                    loadingItems: 3,
                    loadingLabel: "Loading playlist",
                    errorLabel: "Failed to load playlists"
                }),
                onclick: async (ctx) => {
                    // This will be handled by submenu, but keep as fallback
                    ctx.closeMenu();
                }
            })
        );
    }

    // Copy Link
    actions.push(
        createCtxAction({
            label: "Copy Song Link",
            icon: SolarCopyLinear,
            shortcut: shortcuts.ctrl.c,
            onclick: async (ctx) => {
                const link = `${window.location.origin}/song?id=${song.videoId}`;
                navigator.clipboard.writeText(link);
                toast.success("Song link copied to clipboard");
                ctx.closeMenu();
            }
        })
    );

    // Song Info
    actions.push(
        createCtxAction({
            label: "Song Info",
            icon: SolarInfoCircleLinear,
            shortcut: shortcuts.i,
            separator: true,
            onclick: async (ctx) => {
                toast.info(`${song.name} by ${song.artist.name}`);
                ctx.closeMenu();
            }
        })
    );

    return actions;
}

// Queue context menu factory
export function createQueueActions(song: SongDetailed): CtxAction[] {
    const actions: CtxAction[] = [];
    const playerState = get(playerStore);

    // If this is the currently playing song
    if (song.videoId === playerState.meta?.videoId) {
        const isPaused = playerState.state === "paused";
        actions.push(
            createCtxAction({
                label: isPaused ? "Resume" : "Pause",
                icon: isPaused ? SolarPlayLinear : SolarPauseLinear,
                shortcut: shortcuts.space,
                onclick: async (ctx) => {
                    await togglePause();
                    ctx.closeMenu();
                }
            })
        );
    } else {
        actions.push(
            createCtxAction({
                label: "Play",
                icon: SolarPlayLinear,
                shortcut: shortcuts.space,
                onclick: async (ctx) => {
                    await play(song, true);
                    ctx.closeMenu();
                }
            })
        );

        actions.push(
            createCtxAction({
                label: "Remove from Queue",
                icon: SolarNotificationLinesRemoveLinear,
                type: "error",
                shortcut: shortcuts.delete,
                onclick: async (ctx) => {
                    await removeFromQueue(song);
                    toast.success("Removed from queue");
                    ctx.closeMenu();
                }
            })
        );
    }

    return actions;
}

// Playlist context menu factory
export function createPlaylistActions(playlistData: { name: string; id: string }, loginUserID: string | null): CtxAction[] {
    const actions: CtxAction[] = [];

    // Share
    actions.push(
        createCtxAction({
            label: "Share Playlist",
            icon: SolarShareLinear,
            shortcut: shortcuts.ctrl.s,
            onclick: async (ctx) => {
                try {
                    const resp = await fetch(`/api/playlist/${playlistData.id}`, {
                        method: "POST",
                        body: JSON.stringify({
                            key: "fetch",
                            value: { playlistID: playlistData.id }
                        }),
                        headers: { "Content-Type": "application/json" }
                    });

                    const plData = await resp.json();
                    if (!resp.ok) {
                        toast.error(plData.error);
                    } else if (plData.isPublic) {
                        const playlistURL = `${window.location.origin}/playlist/${loginUserID}/${playlistData.id}`;
                        navigator.clipboard.writeText(playlistURL);
                        toast.success("Playlist URL copied to clipboard");
                    } else {
                        toast.error("Playlist is private");
                    }
                    ctx.closeMenu();
                } catch (error) {
                    toast.error("Failed to share playlist");
                    ctx.closeMenu();
                }
            }
        })
    );

    // Rename
    actions.push(
        createCtxAction({
            label: "Rename Playlist",
            icon: SolarRestartLinear,
            shortcut: shortcuts.f2,
            onclick: async (ctx) => {
                showPlRenamePopup(playlistData);
                ctx.closeMenu();
            }
        })
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
                showPlDeletePopup(playlistData);
                ctx.closeMenu();
            }
        })
    );

    return actions;
}

// Playlist song context menu factory
export function createPlaylistSongActions(
    song: SongDetailed,
    playlistData: { name: string; id: string },
    loginUserID: string | null,
    accessedUserID: string | null
): CtxAction[] {
    const actions: CtxAction[] = [];

    // Play
    actions.push(
        createCtxAction({
            label: "Play",
            icon: SolarPlayLinear,
            shortcut: shortcuts.space,
            onclick: async (ctx) => {
                await play(song);
                ctx.closeMenu();
            }
        })
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
                    await addToQueue(song);
                    toast.success("Added to queue");
                    ctx.closeMenu();
                }
            })
        );
    }

    // Copy Link
    actions.push(
        createCtxAction({
            label: "Copy Song Link",
            icon: SolarCopyLinear,
            shortcut: shortcuts.ctrl.c,
            onclick: async (ctx) => {
                const link = `https://music.youtube.com/watch?v=${song.videoId}`;
                navigator.clipboard.writeText(link);
                toast.success("Song link copied to clipboard");
                ctx.closeMenu();
            }
        })
    );

    // Remove from Playlist (only if user owns the playlist)
    if (loginUserID && accessedUserID && loginUserID === accessedUserID) {
        actions.push(
            createCtxAction({
                label: "Remove from Playlist",
                icon: SolarTrashBinTrashLinear,
                type: "error",
                shortcut: shortcuts.delete,
                onclick: async (ctx) => {
                    try {
                        const resp = await fetch(`/api/playlist/${playlistData.id}`, {
                            body: JSON.stringify({
                                key: "remove_song",
                                value: {
                                    playlistID: playlistData.id,
                                    songID: song.videoId
                                }
                            }),
                            method: "POST",
                            headers: { "Content-Type": "application/json" }
                        });

                        const respData = await resp.json();
                        if (resp.ok) {
                            toast.success("Removed song from playlist");
                            invalidateAll();
                        } else {
                            toast.error(respData.error);
                        }
                        ctx.closeMenu();
                    } catch (error) {
                        toast.error("Failed to remove song from playlist");
                        ctx.closeMenu();
                    }
                }
            })
        );
    }

    return actions;
}

// Load playlist submenu dynamically
async function loadPlaylistSubmenu(song: SongDetailed): Promise<CtxAction[]> {
    try {
        const resp = await fetch(`/api/playlists`);
        const playlists = (await resp.json()) as InsertPlaylist[];

        if (playlists.length === 0) {
            return [
                createCtxAction({
                    label: "No playlists found",
                    icon: SolarConfoundedCircleLinear,
                    disabled: true,
                    onclick: async () => {}
                })
            ];
        }

        return playlists.map((playlist) =>
            createCtxAction({
                label: playlist.name,
                image: playlist.cover || undefined,
                icon: playlist.cover ? undefined : SolarMusicLibraryLinear,
                onclick: async (ctx) => {
                    ctx.closeMenu();

                    try {
                        const resp = await fetch(`/api/playlist/${playlist.id}`, {
                            body: JSON.stringify({
                                key: "add_song",
                                value: {
                                    playlistID: playlist.id,
                                    songID: song.videoId,
                                    songCover: song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")
                                }
                            }),
                            method: "POST",
                            headers: { "Content-Type": "application/json" }
                        });

                        const respData = await resp.json();
                        if (resp.ok) {
                            toast.success("Added song to playlist");
                        } else {
                            toast.error(respData.error);
                        }
                    } catch (error) {
                        toast.error("Failed to add song to playlist");
                    }
                }
            })
        );
    } catch (error) {
        throw new Error("Failed to load playlists");
    }
}
