<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import type { UserData } from "$lib/discord/types";
    import { play } from "$lib/player";
    import { cn } from "$lib/utils/cn";
    import { fade } from "svelte/transition";
    import type { SongDetailed } from "ytmusic-api";
    import SolarAltArrowLeftLinear from "~icons/solar/alt-arrow-left-linear";
    import SolarAltArrowRightLinear from "~icons/solar/alt-arrow-right-linear";

    interface Props {
        skeleton?: boolean;
        skeletonCount?: number;
        user?: UserData;
        songs?: SongDetailed[];
        class?: string;
    }
    let { skeleton = false, skeletonCount = 10, user, songs, class: className }: Props = $props();

    let songList: HTMLDivElement | null = $state(null);

    function scrollSection(direction: "left" | "right") {
        if (songList) {
            songList.scrollTo({
                left: direction === "left" ? songList.scrollLeft - 1000 : songList.scrollLeft + 1000,
                behavior: "smooth",
            });
        }
    }
</script>

{#if skeleton}
    <div class={cn("flex gap-2 overflow-x-auto overflow-y-hidden py-2 md:py-5", className)} style="scrollbar-width: none;">
        {#each Array(skeletonCount) as _}
            <div class="flex shrink-0 flex-col items-start justify-center gap-2 rounded-lg bg-slate-800 p-3">
                <div class="size-40 shrink-0 animate-pulse rounded-lg bg-slate-900 md:size-50"></div>
                <div class="flex size-full flex-col gap-1">
                    <div class="h-5 w-full animate-pulse rounded-lg bg-slate-900"></div>
                    <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                </div>
            </div>
        {/each}
    </div>
{:else if songs}
    <div class={cn("group relative", className)}>
        <div
            in:fade={{ duration: 100 }}
            bind:this={songList}
            class="flex gap-2 overflow-x-auto overflow-y-hidden py-2 md:py-5"
            style="scrollbar-width: none;"
        >
            {#each songs as song}
                {@const thumb = song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
                <button
                    class="flex shrink-0 cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
                    onclick={async () => {
                        await play(song);
                    }}
                    oncontextmenu={async(e) => {
                        e.preventDefault();
                        const { createSongActions } = await import("$lib/ctxmenu/actions");
                        const { openCtxMenu, closeCtxMenu } = await import("$lib/ctxmenu");
                        const actions = createSongActions(song, user?.id || null);
                        openCtxMenu(e, actions);
                    }}
                >
                    <img src={thumb} alt="{song.name}'s Thumbnail" class="size-40 rounded-lg md:size-50" />
                    <div class="text-left">
                        <p class="text-sm">{song.name.length > 20 ? song.name.slice(0, 20) + "..." : song.name}</p>
                        <p class="text-sm text-slate-400">
                            {song.artist.name.length > 20 ? song.artist.name.slice(0, 20) + "..." : song.artist.name}
                        </p>
                    </div>
                </button>
            {/each}

            <div
                class="pointer-events-none absolute inset-0 mb-10 flex items-center justify-between px-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            >
                <Button onclick={() => scrollSection("left")} size="" class="pointer-events-auto left-0 flex items-center justify-center p-2">
                    <SolarAltArrowLeftLinear class="size-6" />
                </Button>
                <Button onclick={() => scrollSection("right")} size="" class="pointer-events-auto right-0 flex items-center justify-center p-2">
                    <SolarAltArrowRightLinear class="size-6" />
                </Button>
            </div>
        </div>
    </div>
{/if}
