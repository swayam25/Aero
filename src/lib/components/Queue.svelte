<script lang="ts">
    import Draggable from "$lib/components/ui/Draggable.svelte";
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import { createQueueActions, openCtxMenu } from "$lib/ctxmenu";
    import { play, store } from "$lib/player";
    import { fade } from "svelte/transition";
    import HugeiconsCd from "~icons/hugeicons/cd";

    function handleReorder(fromIndex: number, toIndex: number) {
        store.update((s) => {
            const [movedItem] = s.queue.splice(fromIndex, 1);
            s.queue.splice(toIndex, 0, movedItem);
            return { ...s };
        });
    }
</script>

<div in:fade={{ duration: 200 }} class="w-full rounded-lg bg-slate-900 md:h-full">
    <div class="flex w-full items-center justify-start gap-2 p-5">
        <h1 class="text-3xl font-bold md:text-4xl">Queue</h1>
    </div>

    <div id="queue" class="h-[calc(100vh-232px)] overflow-x-hidden overflow-y-auto px-2 pb-2 md:px-5 md:pb-5">
        {#each $store.queue as song, idx (song.videoId)}
            <Draggable items={$store.queue} onReorder={handleReorder} class="w-full">
                {#snippet children({ isDragging, dragIndex }: { isDragging: boolean; dragIndex: number })}
                    <button
                        onclick={async () => {
                            await play(song, true);
                        }}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            const actions = createQueueActions(song);
                            openCtxMenu(e, actions);
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
                {/snippet}
            </Draggable>
        {/each}
    </div>
</div>
