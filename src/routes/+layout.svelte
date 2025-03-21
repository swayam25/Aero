<script lang="ts">
    import { onNavigate } from "$app/navigation";
    import CtxMenu from "$lib/components/CtxMenu.svelte";
    import Navbar from "$lib/components/Navbar.svelte";
    import Player from "$lib/components/Player.svelte";
    import Queue from "$lib/components/Queue.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import { closeCtxMenu } from "$lib/ctxmenu";
    import { store } from "$lib/player";
    import type { Snippet } from "svelte";
    import { expoOut } from "svelte/easing";
    import { fly } from "svelte/transition";
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

<div class="grid h-screen w-screen grid-cols-3 grid-rows-[auto_1fr_auto] overflow-hidden md:grid-cols-[5rem_auto_30vw] md:gap-2 md:p-2">
    <div class="col-span-3">
        <Navbar user={data.user} />
    </div>
    <div class="col-span-1 row-span-1 hidden md:block">
        <Sidebar user={data.user} />
    </div>
    <div
        id="body"
        class="col-span-3 row-span-1 size-full overflow-x-hidden overflow-y-auto rounded-lg p-2 md:col-span-1 md:bg-slate-900 md:p-5"
        class:md:!col-span-2={!$store.showQueue}
    >
        <div class="container m-auto size-full">
            {@render children()}
        </div>
    </div>
    {#if $store.showQueue}
        <!-- Here "window.innerWidth >= 768" refers to "md" breakpoint -->
        <div
            in:fly={{ duration: 500, easing: expoOut, x: window.innerWidth >= 768 ? 100 : 0, y: window.innerWidth < 768 ? 100 : 0 }}
            out:fly={{ duration: window.innerWidth >= 768 ? 0 : 500, easing: expoOut, x: 0, y: window.innerWidth < 768 ? 100 : 0 }}
            class="fixed bottom-0 z-300 flex size-full items-end justify-center bg-slate-900/50 md:relative md:z-0 md:col-span-1 md:row-span-1 md:block"
        >
            <Queue />
        </div>
    {/if}
    <div class="col-span-3">
        <Player user={data.user} />
    </div>
</div>
