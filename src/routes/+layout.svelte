<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import BottomBar from "$lib/components/BottomBar.svelte";
    import CtxMenu from "$lib/components/CtxMenu.svelte";
    import Lyrics from "$lib/components/Lyrics.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import Player from "$lib/components/Player.svelte";
    import Queue from "$lib/components/Queue.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { closeCtxMenu } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import { store } from "$lib/player";
    import { supabase } from "$lib/supabase";
    import { type Snippet } from "svelte";
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
    let playlists: InsertPlaylist[] = $state(data.playlists);
    $effect(() => {
        playlists = data.playlists;
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
                        filter: `user_id=eq.${data.user?.id}`
                    },
                    (payload) => {
                        const { new: newPlaylist } = payload;
                        playlists = playlists.map((playlist: InsertPlaylist) => {
                            if (playlist.id === newPlaylist.id) {
                                return { ...playlist, ...newPlaylist };
                            }
                            return playlist;
                        });
                    }
                )
                .subscribe();
        }
    });
</script>

<svelte:window
    on:click={closeCtxMenu}
    oncontextmenu={(e) => {
        e.preventDefault();
    }}
/>
<CtxMenu />

<Toaster
    richColors
    position="bottom-center"
    theme="dark"
    toastOptions={{
        classes: {
            toast: "mb-30 md:mb-15 rounded-lg font-rubik",
            title: "text-sm",
            description: "text-[0.65rem]"
        }
    }}
/>

<div class="grid h-screen w-screen grid-cols-3 grid-rows-[auto_1fr_auto] overflow-hidden md:grid-cols-[5rem_auto_30vw] md:gap-2 md:p-2">
    <div class="col-span-3">
        <Navbar user={data.user} />
    </div>
    <div class="col-span-1 row-span-1 hidden md:block">
        <Sidebar user={data.user} {playlists} />
    </div>
    <div
        id="body"
        class="col-span-3 row-span-1 size-full overflow-x-hidden overflow-y-auto rounded-lg p-2 md:col-span-1 md:bg-slate-900 md:p-5"
        class:md:!col-span-2={!$store.showQueue && !$store.showLyrics}
    >
        <div class="container m-auto size-full">
            {@render children()}
            <div class="h-40 md:hidden"></div>
        </div>
    </div>
    <div class="md:hidden">
        <BottomBar user={data.user} />
    </div>
    {#if $store.showQueue || $store.showLyrics}
        <!-- Here "window.innerWidth >= 768" refers to "md" breakpoint -->
        <div
            in:fly={{ duration: window.innerWidth >= 768 ? 0 : 200, easing: expoOut }}
            out:fly={{ duration: window.innerWidth >= 768 ? 0 : 200, easing: expoOut }}
            class="fixed bottom-0 z-300 size-full bg-slate-900/50 md:relative md:z-0 md:col-span-1 md:row-span-1 md:block"
        >
            <div
                in:fly={{ duration: 500, easing: expoOut, x: window.innerWidth >= 768 ? 100 : 0, y: window.innerWidth < 768 ? 100 : 0 }}
                out:fly={{ duration: window.innerWidth >= 768 ? 0 : 500, easing: expoOut, x: 0, y: window.innerWidth < 768 ? 100 : 0 }}
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
    <div class="fixed bottom-15 w-full p-2 md:relative md:bottom-0 md:col-span-3 md:p-0">
        <div class="rounded-lg bg-slate-900 md:rounded-none md:bg-transparent">
            <Player user={data.user} />
        </div>
    </div>
</div>
