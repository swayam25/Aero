<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { play } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarAltArrowLeftLinear from "~icons/solar/alt-arrow-left-linear";
    import SolarAltArrowRightLinear from "~icons/solar/alt-arrow-right-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    function scrollSection(idx: number, direction: "left" | "right") {
        const section = document.getElementById(`sec-${idx}`);
        if (section) {
            section.scrollTo({
                left: direction === "left" ? section.scrollLeft - 1000 : section.scrollLeft + 1000,
                behavior: "smooth"
            });
        }
    }
</script>

<svelte:head>
    <title>Aero</title>
</svelte:head>

<div class="flex flex-col gap-4 md:gap-8">
    {#each Object.keys(data.songs) as categoryName, idx}
        <div class="text-left">
            <h1 class="text-3xl font-bold md:text-4xl">{categoryName}</h1>
            <div class="group relative p-2">
                <div class="mt-2.5 md:mt-5">
                    {#await data.songs[categoryName as keyof typeof data.songs]}
                        <div class="flex gap-2 overflow-x-auto overflow-y-hidden" style="scrollbar-width: none;">
                            {#each Array(10) as _}
                                <div class="flex shrink-0 flex-col items-start justify-center gap-2 rounded-lg bg-slate-800 p-3">
                                    <div class="size-40 shrink-0 animate-pulse rounded-lg bg-slate-900 md:size-50"></div>
                                    <div class="flex size-full flex-col gap-1">
                                        <div class="h-5 w-full animate-pulse rounded-lg bg-slate-900"></div>
                                        <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:then songs}
                        <div
                            in:fade={{ duration: 100 }}
                            id="sec-{idx}"
                            class="flex gap-2 overflow-x-auto overflow-y-hidden"
                            style="scrollbar-width: none;"
                        >
                            {#each songs as song}
                                {@const thumb = song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
                                <button
                                    class="flex shrink-0 cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
                                    onclick={async () => {
                                        await play(song.videoId, song);
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
                                <Button
                                    onclick={() => scrollSection(idx, "left")}
                                    size=""
                                    class="pointer-events-auto left-0 flex items-center justify-center p-2"
                                >
                                    <SolarAltArrowLeftLinear class="size-6" />
                                </Button>
                                <Button
                                    onclick={() => scrollSection(idx, "right")}
                                    size=""
                                    class="pointer-events-auto right-0 flex items-center justify-center p-2"
                                >
                                    <SolarAltArrowRightLinear class="size-6" />
                                </Button>
                            </div>
                        </div>
                    {/await}
                </div>
            </div>
        </div>
    {/each}
</div>
