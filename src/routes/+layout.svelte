<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import BottomBar from "$lib/components/BottomBar.svelte";
    import Lyrics from "$lib/components/Lyrics.svelte";
    import MobilePlayerDrawers from "$lib/components/mobile/MobileDrawers.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import Player from "$lib/components/Player.svelte";
    import PlaylistDialogPopup from "$lib/components/PlaylistDialogPopup.svelte";
    import Queue from "$lib/components/Queue.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { store as ctxStore, setupShortcuts } from "$lib/ctxmenu";
    import ContextMenu from "$lib/ctxmenu/components/ContextMenu.svelte";
    import { preloadPlaylistsCache } from "$lib/ctxmenu/playlist";
    import type { InsertPlaylist } from "$lib/db/schema";
    import { store } from "$lib/player";
    import { playlistsCache } from "$lib/stores";
    import { supabase } from "$lib/supabase";
    import { createMobileMediaQuery } from "$lib/utils/mobile";
    import { onMount, type Snippet } from "svelte";
    import { Toaster } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fly } from "svelte/transition";
    import "../app.css";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
        children: Snippet;
    }

    let { data, children }: Props = $props();
    let playlists: InsertPlaylist[] = $derived(data.playlists);

    // Mobile detection state
    let isMobile = $state(false);

    // Initialize keyboard shortcuts
    let cleanupShortcuts: (() => void) | undefined;
    let cleanupMobileQuery: (() => void) | undefined;

    onMount(() => {
        cleanupShortcuts = setupShortcuts();

        // Set up mobile detection
        cleanupMobileQuery = createMobileMediaQuery((mobile) => {
            isMobile = mobile;
        });

        if (data.user) {
            preloadPlaylistsCache();
        }

        return () => {
            cleanupShortcuts?.();
            cleanupMobileQuery?.();
        };
    });

    // Show transition when navigating
    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    // Sync playlist data with db
    $effect(() => {
        if (data.user) {
            supabase
                .channel("playlist-changes-layout")
                .on(
                    "postgres_changes",
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "playlist",
                        filter: `user_id=eq.${data.user?.id}`,
                    },
                    (payload) => {
                        const { new: newPlaylist } = payload;
                        playlists = playlists.map((playlist: InsertPlaylist) => {
                            if (playlist.id === newPlaylist.id) {
                                return { ...playlist, ...newPlaylist };
                            }
                            return playlist;
                        });
                        // Update the playlists cache with the new data
                        playlistsCache.updatePlaylist(newPlaylist.id, newPlaylist);
                    },
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "playlist",
                        filter: `user_id=eq.${data.user?.id}`,
                    },
                    (payload) => {
                        const newPlaylist = payload.new as InsertPlaylist;
                        playlists = [newPlaylist, ...playlists];
                        playlistsCache.addPlaylist(newPlaylist);
                    },
                )
                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "playlist",
                        filter: `user_id=eq.${data.user?.id}`,
                    },
                    (payload) => {
                        const { old: oldPlaylist } = payload;
                        playlists = playlists.filter((p) => p.id !== oldPlaylist.id);
                        playlistsCache.removePlaylist(oldPlaylist.id);
                    },
                )
                .subscribe();
        }
    });

    // Handle mobile player state
    let showMobilePlayer = $state(false);
    function handlePlayerClick() {
        if ($store.state !== "unstarted" && isMobile) {
            showMobilePlayer = true;
        }
    }
</script>

<ContextMenu />

<Toaster
    richColors
    position="bottom-center"
    theme="dark"
    style="z-index: 2000;"
    toastOptions={{
        classes: {
            toast: "mb-30 md:mb-15 rounded-lg font-rubik",
            title: "text-sm",
            description: "text-[0.65rem]",
        },
        style: "z-index: 2000;",
    }}
/>

<PlaylistDialogPopup />

{#if isMobile}
    <MobilePlayerDrawers user={data.user} bind:showMobilePlayer />
{/if}

{#if $ctxStore.isOpen}
    <div class="absolute z-900 h-screen w-screen overflow-hidden bg-transparent"></div>
{/if}

<div
    class="grid h-screen w-screen grid-rows-[auto_1fr_auto] overflow-hidden md:gap-2 md:p-2"
    class:md:grid-cols-[5rem_1fr_30vw]={data.user && ($store.showQueue || $store.showLyrics)}
    class:md:grid-cols-[5rem_1fr]={data.user && !($store.showQueue || $store.showLyrics)}
    class:md:grid-cols-[1fr_30vw]={!data.user && ($store.showQueue || $store.showLyrics)}
    class:md:grid-cols-[1fr]={!data.user && !($store.showQueue || $store.showLyrics)}
    role="application"
    oncontextmenu={(e) => {
        e.preventDefault();
    }}
>
    <div class="md:col-span-full">
        <Navbar user={data.user} />
    </div>
    {#if data.user}
        <div class="hidden md:row-start-2 md:block">
            <Sidebar user={data.user} {playlists} />
        </div>
    {/if}
    <div class="size-full overflow-x-hidden overflow-y-auto rounded-lg p-2 md:row-start-2 md:bg-slate-900 md:p-5">
        <div class="container m-auto size-full">
            {@render children()}
            <div class="{data.user ? 'h-40' : 'h-20'} md:hidden"></div>
        </div>
    </div>
    {#if data.user}
        <div class="md:hidden">
            <BottomBar user={data.user} />
        </div>
    {/if}
    {#if !isMobile && ($store.showQueue || $store.showLyrics)}
        <div in:fly={{ duration: 0, easing: expoOut }} out:fly={{ duration: 0, easing: expoOut }} class="md:relative md:z-0 md:row-start-2">
            <div
                in:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                out:fly={{ duration: 0, easing: expoOut, x: 0, y: 0 }}
                class="flex size-full items-end justify-center"
            >
                {#if $store.showQueue}
                    <Queue user={data.user} />
                {:else if $store.showLyrics}
                    <Lyrics />
                {/if}
            </div>
        </div>
    {/if}
    <div class="fixed {data.user ? 'bottom-15' : 'bottom-2'} w-full p-2 md:relative md:bottom-0 md:col-span-full md:row-start-3 md:p-0">
        <div class="rounded-lg bg-slate-900 md:rounded-none md:bg-transparent">
            <Player user={data.user} onSongInfoClick={handlePlayerClick} />
        </div>
    </div>
</div>
