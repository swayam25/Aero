<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import BottomBar from "$lib/components/BottomBar.svelte";
    import CtxMenu from "$lib/components/CtxMenu.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import Player from "$lib/components/Player.svelte";
    import Queue from "$lib/components/Queue.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { closeCtxMenu } from "$lib/ctxmenu";
    import { store } from "$lib/player";
    import { type Snippet } from "svelte";
    import { Toaster } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import "../app.css";
    import type { PageData } from "./$types";

    interface Props {
        data: PageData;
        children: Snippet;
    }

    let { data, children }: Props = $props();

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
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
        <Sidebar user={data.user} playlists={data.playlists} />
    </div>
    <div
        id="body"
        class="col-span-3 row-span-1 size-full overflow-x-hidden overflow-y-auto rounded-lg p-2 md:col-span-1 md:bg-slate-900 md:p-5"
        class:md:!col-span-2={!$store.showQueue}
    >
        <div class="container mx-auto mb-60 size-full md:m-auto md:mb-0">
            {@render children()}
        </div>
    </div>
    <div class="md:hidden">
        <BottomBar user={data.user} />
    </div>
    {#if $store.showQueue}
        <!-- Here "window.innerWidth >= 768" refers to "md" breakpoint -->
        <div
            transition:fade={{ duration: window.innerWidth < 768 ? 100 : 0 }}
            class="fixed bottom-0 z-300 size-full bg-slate-900/50 md:relative md:z-0 md:col-span-1 md:row-span-1 md:block"
        >
            <div
                in:fly={{ duration: 500, easing: expoOut, x: window.innerWidth >= 768 ? 100 : 0, y: window.innerWidth < 768 ? 100 : 0 }}
                out:fly={{ duration: window.innerWidth >= 768 ? 0 : 500, easing: expoOut, x: 0, y: window.innerWidth < 768 ? 100 : 0 }}
                class="flex size-full items-end justify-center"
            >
                <Queue user={data.user} />
            </div>
        </div>
    {/if}
    <div class="fixed bottom-15 w-full p-2 md:relative md:bottom-0 md:col-span-3 md:p-0">
        <div class="rounded-lg bg-slate-900 md:rounded-none md:bg-transparent">
            <Player user={data.user} />
        </div>
    </div>
</div>
