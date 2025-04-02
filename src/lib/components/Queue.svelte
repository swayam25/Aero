<script lang="ts">
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { play, store } from "$lib/player";
    import { reorder, useSortable } from "$lib/sortable/index.svelte";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import type { SongDetailed } from "ytmusic-api";
    import HugeiconsCd from "~icons/hugeicons/cd";
    import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
    import Button from "./ui/Button.svelte";

    let { user }: { user: UserData } = $props();
    let queue: SongDetailed[] = $derived($store.queue);

    let sortable: HTMLElement | null = $state(null);
    useSortable(() => sortable, {
        animation: 150,
        handle: ".song-handle",
        onEnd(event) {
            $store.queue = reorder($store.queue, event);
        }
    });
</script>

<div class="h-80 w-full rounded-lg bg-slate-900 md:h-full md:w-[30vw]">
    <div class="flex w-full items-center justify-start gap-2 p-5">
        <Button
            class="size-8 bg-slate-800 p-2 md:hidden {$store.state === 'unstarted' ? 'pointer-events-none opacity-0' : 'opacity-100'}"
            size=""
            onclick={() => ($store.showQueue = false)}
        >
            <SolarAltArrowDownLinear class="size-full" />
        </Button>
        <h1 class="text-3xl font-bold md:text-4xl">Queue</h1>
    </div>
    <ul bind:this={sortable} id="queue" class="flex h-60 list-none flex-col overflow-x-hidden overflow-y-auto px-5 pb-5 md:h-[calc(100vh-232px)]">
        {#each queue as song, idx}
            <li class="w-full">
                <button
                    onclick={async () => {
                        await play(song, true);
                    }}
                    in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                    out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                    oncontextmenu={(e) => {
                        e.preventDefault();
                        openCtxMenu(e, user?.id, song, null, "queue");
                    }}
                    class="song-handle flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                >
                    <div class="size-10 p-1 text-lg">
                        {#if song.videoId === $store.meta?.videoId}
                            <span in:fade={{ duration: 100 }} class="size-full">
                                <HugeiconsCd class="size-full animate-spin text-sky-500" />
                            </span>
                        {:else}
                            <span in:fade={{ duration: 100 }} class="size-full text-slate-200">{idx + 1}</span>
                        {/if}
                    </div>
                    <img src={song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")} alt="{song.name}'s Thumbnail" class="size-15 rounded-lg" />
                    <div class="flex w-full flex-col items-center justify-center text-left">
                        <MarqueeText class="w-10 font-bold" text={song.name} />
                        <MarqueeText class="w-10 text-sm text-slate-400" text={song.artist.name} />
                    </div>
                </button>
            </li>
        {/each}
    </ul>
</div>
