<script lang="ts">
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { play, store } from "$lib/player";
    import { draggable, type DragOptions } from "@neodrag/svelte";
    import { flip } from "svelte/animate";
    import { fade } from "svelte/transition";
    import HugeiconsCd from "~icons/hugeicons/cd";
    import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
    import Button from "./ui/Button.svelte";

    let { user }: { user: UserData } = $props();

    let currentDragIndex = $state(0);
    let translateY = $state(0);
    let lastOffsetY = $state(0);
    let dragging = $state(false);

    const options: DragOptions = {
        axis: "y",
        bounds: "parent",
        recomputeBounds: {
            drag: true
        },
        onDragStart({ rootNode, offsetY }) {
            currentDragIndex = [...rootNode.parentNode!.children].indexOf(rootNode);
            lastOffsetY = offsetY;
            translateY = 0;
            dragging = true;
        },
        onDrag({ rootNode, offsetY }) {
            translateY += offsetY - lastOffsetY;
            lastOffsetY = offsetY;
            if (translateY > 0.5 * rootNode.clientHeight && currentDragIndex != $store.queue.length - 1) {
                shiftItem(rootNode, 1);
            } else if (translateY < -0.5 * rootNode.clientHeight && currentDragIndex != 0) {
                shiftItem(rootNode, -1);
            }
        },
        onDragEnd({ rootNode }) {
            rootNode.style.transform = `translate3d(0,0,0)`;
            translateY = 0;
            dragging = false;
        },
        transform() {
            return `translate3d(0,${translateY}px,0)`;
        }
    };

    function shiftItem(item: HTMLElement, shift: number) {
        store.update((s) => {
            s.queue.splice(currentDragIndex + shift, 0, $store.queue.splice(currentDragIndex, 1)[0]);
            return { ...s };
        });
        currentDragIndex += shift;
        translateY -= shift * item.offsetHeight;
    }
</script>

<div in:fade={{ duration: 200 }} class="w-full rounded-lg bg-slate-900 md:h-full">
    <div class="flex w-full items-center justify-start gap-2 p-5">
        <Button class="size-8 bg-slate-800 p-2 md:hidden" size="" onclick={() => ($store.showQueue = false)}>
            <SolarAltArrowDownLinear class="size-full" />
        </Button>
        <h1 class="text-3xl font-bold md:text-4xl">Queue</h1>
    </div>

    <div id="queue" class="h-[calc(100vh-232px)] overflow-x-hidden overflow-y-auto px-2 pb-2 md:px-5 md:pb-5">
        {#each $store.queue as song, idx (song.videoId)}
            <div
                class="w-full"
                animate:flip={{
                    duration: idx === currentDragIndex + 1 || idx === currentDragIndex - 1 || !dragging ? 250 : 0
                }}
                use:draggable={options}
            >
                <button
                    onclick={async () => {
                        await play(song, true);
                    }}
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
            </div>
        {/each}
    </div>
</div>
