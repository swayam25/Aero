<script lang="ts">
    import Button from "$lib/components/ui/Button.svelte";
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import { play } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarAltArrowLeftLinear from "~icons/solar/alt-arrow-left-linear";
    import SolarAltArrowRightLinear from "~icons/solar/alt-arrow-right-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    function scrollSection(direction: "left" | "right") {
        const section = document.getElementById(`sec-search`);
        if (section) {
            section.scrollTo({
                left: direction === "left" ? section.scrollLeft - 1000 : section.scrollLeft + 1000,
                behavior: "smooth"
            });
        }
    }
</script>

<div class="">
    {#await data.songs}
        <div class="flex items-start justify-between gap-5">
            <div class="flex size-full flex-col items-center justify-center gap-2 md:items-start">
                <p class="hidden text-4xl font-bold md:block">Top Result</p>
                <div class="flex flex-col items-center justify-center gap-2 rounded-lg bg-slate-800 p-5 md:size-full md:items-start">
                    <div class="size-55 animate-pulse rounded-lg bg-slate-900"></div>
                    <div class="flex size-full flex-col items-start justify-center gap-2">
                        <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                        <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                    </div>
                </div>
            </div>
            <div class="hidden size-full flex-col items-start justify-center gap-2 md:flex">
                <p class="text-4xl font-bold">Songs</p>
                <div class="flex size-full flex-col items-center justify-start gap-2">
                    {#each Array(4) as _}
                        <div class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 p-2 transition-colors duration-200">
                            <div class="size-15 animate-pulse rounded-lg bg-slate-900"></div>
                            <div class="flex w-full flex-col items-start justify-center gap-2 text-left">
                                <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900 font-bold"></div>
                                <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        <div class="mt-5 flex gap-2 overflow-x-auto overflow-y-hidden p-2" style="scrollbar-width: none;">
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
        <div in:fade={{ duration: 100 }} class="flex flex-col items-start justify-between gap-5 md:flex-row">
            <div class="flex size-full flex-col items-center justify-center gap-2 md:items-start">
                <p class="hidden text-4xl font-bold md:block">Top Result</p>
                <button
                    onclick={async () => {
                        await play(songs[0]);
                    }}
                    oncontextmenu={(e) => {
                        e.preventDefault();
                        openCtxMenu(e, songs[0]);
                    }}
                    class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg bg-slate-800 p-5 transition-colors duration-200 hover:bg-slate-700 md:size-full md:items-start"
                >
                    <img
                        src={songs[0].thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
                        alt="{songs[0].name}'s Thumbnail"
                        class="size-55 rounded-lg"
                    />
                    <div class="flex flex-col items-start justify-center gap-0.5 text-left">
                        <p class="w-full text-lg font-bold md:text-2xl">{songs[0].name}</p>
                        <p class="w-full text-slate-400 md:text-lg">{songs[0].artist.name}</p>
                    </div>
                </button>
            </div>
            <div class="size-full flex-col items-start justify-center gap-2 md:flex">
                <p class="hidden text-4xl font-bold md:block">Songs</p>
                <div class="flex size-full flex-col items-center justify-start gap-2 *:cursor-pointer">
                    {#each songs.slice(1, 5) as song}
                        <button
                            onclick={async () => {
                                await play(song);
                            }}
                            oncontextmenu={(e) => {
                                e.preventDefault();
                                openCtxMenu(e, song);
                            }}
                            class="flex w-full items-center justify-center gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                        >
                            <img
                                src={song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
                                alt="{song.name}'s Thumbnail"
                                class="size-15 rounded-lg"
                            />
                            <div class="flex w-full flex-col items-center justify-center text-left">
                                <MarqueeText class="w-10 font-bold" text={song.name} />
                                <MarqueeText class="w-10 text-sm text-slate-400" text={song.artist.name} />
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        </div>
        <div class="group relative mt-5 p-2">
            <div in:fade={{ duration: 100 }} id="sec-search" class="flex gap-2 overflow-x-auto overflow-y-hidden" style="scrollbar-width: none;">
                {#each songs.slice(5) as song}
                    {@const thumb = song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
                    <button
                        class="flex shrink-0 cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
                        onclick={async () => {
                            await play(song);
                        }}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            openCtxMenu(e, song);
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
    {/await}
</div>
