<script lang="ts">
    import { goto } from "$app/navigation";
    import BottomBar from "$lib/components/BottomBar.svelte";
    import Lyrics from "$lib/components/Lyrics.svelte";
    import MobilePlayerDrawers from "$lib/components/mobile/MobileDrawers.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import Player from "$lib/components/Player.svelte";
    import PlaylistActionPopups from "$lib/components/PlaylistActionPopups.svelte";
    import Queue from "$lib/components/Queue.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { store as ctxStore, setupShortcuts } from "$lib/ctxmenu";
    import ContextMenu from "$lib/ctxmenu/components/ContextMenu.svelte";
    import type { InsertPlaylist, SelectRoom, SelectRoomMember } from "$lib/db/schema";
    import { store } from "$lib/player";
    import { playlistsCache } from "$lib/stores";
    import { userRoomStore } from "$lib/stores/userRoom";
    import createNormalizedChannel from "$lib/supabase/channel";
    import { createMobileMediaQuery } from "$lib/utils/mobile";
    import type { RealtimeChannel } from "@supabase/supabase-js";
    import { onMount, type Snippet } from "svelte";
    import { toast, Toaster } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fly } from "svelte/transition";
    import { setupViewTransition } from "sveltekit-view-transition";
    import "../app.css";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
        children: Snippet;
    }

    let { data, children }: Props = $props();

    // Mobile detection state
    let isMobile = $state(false);

    // Initialize keyboard shortcuts
    let cleanupShortcuts: (() => void) | undefined;
    let cleanupMobileQuery: (() => void) | undefined;

    playlistsCache.load(data.playlists);
    onMount(() => {
        cleanupShortcuts = setupShortcuts();

        // Set up mobile detection
        cleanupMobileQuery = createMobileMediaQuery((mobile) => {
            isMobile = mobile;
        });

        return () => {
            cleanupShortcuts?.();
            cleanupMobileQuery?.();
        };
    });

    // View Transitions
    setupViewTransition();

    // Sync playlist data with db
    $effect(() => {
        let plChannel: RealtimeChannel;

        if (data.user) {
            plChannel = createNormalizedChannel("playlist-changes-layout")
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
                        if (newPlaylist.id) playlistsCache.updatePlaylist(newPlaylist.id, newPlaylist);
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
                        playlistsCache.addPlaylist(newPlaylist);
                    },
                )
                .on(
                    "postgres_changes",
                    {
                        event: "DELETE",
                        schema: "public",
                        table: "playlist",
                        filter: `id=in.(${$playlistsCache.playlists.map((p) => p.id).join(",")})`, // Only id is returned on delete, so filter based on existing playlist ids
                    },
                    (payload) => {
                        const oldPlaylist = payload.old as { id: string };
                        if (oldPlaylist.id) playlistsCache.removePlaylist(oldPlaylist.id);
                    },
                )
                .subscribe();
        }
        return () => {
            if (plChannel) plChannel.unsubscribe();
        };
    });

    // Room data
    userRoomStore.set(data.userRoom);
    $effect(() => {
        let channel: RealtimeChannel;
        if (data.user) {
            channel = createNormalizedChannel("user-room-global-events");
            channel.on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "room", filter: `host_user_id=eq.${data.user.id}` },
                (payload) => {
                    const newRoom = payload.new as SelectRoom;
                    userRoomStore.set(newRoom);
                },
            );
            if ($userRoomStore && $userRoomStore.id) {
                channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "room", filter: `id=eq.${$userRoomStore.id}` }, () => {
                    if ($userRoomStore?.hostUserData.id !== data.user.id) {
                        toast.info(`${$userRoomStore?.name} room has been deleted`);
                    }
                    if (window.location.pathname.includes($userRoomStore.id!)) {
                        goto("/room", { invalidateAll: true });
                    }
                    userRoomStore.clear();
                });
            }
            channel.on(
                "postgres_changes",
                { event: "*", schema: "public", table: "room_member", filter: `user_id=eq.${data.user.id}` },
                async (payload) => {
                    const member = payload.new as SelectRoomMember;
                    const resp = await fetch("/api/room/" + member.roomId, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    if (resp.ok) {
                        const respData = await resp.json();
                        if (respData.room) {
                            userRoomStore.set(respData.room as SelectRoom);
                        }
                    }
                },
            );
            if ($userRoomStore && $userRoomStore.id) {
                channel.on(
                    "postgres_changes",
                    { event: "DELETE", schema: "public", table: "room_member", filter: `user_id=eq.${data.user.id}` },
                    () => {
                        userRoomStore.clear();
                    },
                );
            }
            channel.subscribe();
        }
        return () => {
            if (channel) channel.unsubscribe();
        };
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

<PlaylistActionPopups />

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
            <Sidebar user={data.user} />
        </div>
    {/if}
    <div id="body" class="size-full overflow-x-hidden overflow-y-auto rounded-lg p-2 md:row-start-2 md:bg-slate-900 md:p-5">
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
