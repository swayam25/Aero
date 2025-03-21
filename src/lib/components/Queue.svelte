<script lang="ts">
    import MarqueeText from "$lib/components/MarqueeText.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import { play, store } from "$lib/player";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
</script>

<div class="rounded-lg bg-slate-900 md:w-[calc(100vw-70vw)]">
    <h1 class="p-5 text-3xl font-bold md:text-4xl">Queue</h1>
    <div class="h-[calc(100vh-232px)] overflow-x-hidden overflow-y-auto px-5 pb-5 *:cursor-pointer">
        {#each $store.queue as song, idx}
            <button
                onclick={async () => {
                    await play(song);
                }}
                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                oncontextmenu={(e) => {
                    e.preventDefault();
                    openCtxMenu(e, song, "queue");
                }}
                class="flex w-full items-center justify-center gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
            >
                <div class="p-1 text-lg">
                    {#if song.videoId === $store.meta?.videoId}
                        <span in:fade={{ duration: 100 }}>P</span>
                    {:else}
                        <span in:fade={{ duration: 100 }} class="text-slate-200">{idx + 1}</span>
                    {/if}
                </div>
                <img src={song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")} alt="{song.name}'s Thumbnail" class="size-15 rounded-lg" />
                <div class="flex w-full flex-col items-center justify-center text-left">
                    <MarqueeText class="w-10 font-bold" text={song.name} />
                    <MarqueeText class="w-10 text-sm text-slate-400" text={song.artist.name} />
                </div>
            </button>
        {/each}
    </div>
</div>
