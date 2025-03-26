<script lang="ts">
    import SongListX from "$lib/components/SongListX.svelte";
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import { play } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import { fade } from "svelte/transition";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
    <title>Aero | Search</title>
</svelte:head>

{#await data.songs}
    <div class="flex flex-col items-start justify-between gap-5 md:flex-row">
        <div class="flex size-full flex-col items-center justify-center gap-2 md:items-start">
            <p class="hidden text-4xl font-bold md:block">Top Result</p>
            <div class="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-slate-800 p-5 md:size-full md:items-start">
                <div class="size-55 animate-pulse rounded-lg bg-slate-900"></div>
                <div class="flex size-full flex-col items-start justify-center gap-2">
                    <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                    <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                </div>
            </div>
        </div>
        <div class="size-full flex-col items-start justify-center gap-2 md:flex">
            <p class="hidden text-4xl font-bold md:block">Songs</p>
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
    <SongListX skeleton />
{:then songs}
    <div in:fade={{ duration: 100 }} class="flex h-min flex-col items-stretch justify-between gap-5 md:flex-row">
        <div class="flex w-full min-w-2/5 flex-auto flex-col items-start justify-center gap-2">
            <p class="block text-4xl font-bold">Top Result</p>
            <button
                onclick={async () => {
                    await play(songs[0]);
                }}
                oncontextmenu={(e) => {
                    e.preventDefault();
                    openCtxMenu(e, data.user?.id, songs[0]);
                }}
                class="flex h-full w-full cursor-pointer flex-col items-start justify-between gap-0 rounded-lg bg-slate-800 p-5 transition-colors duration-200 hover:bg-slate-700"
            >
                <img
                    src={songs[0].thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
                    alt="{songs[0].name}'s Thumbnail"
                    class="size-30 rounded-lg md:size-45"
                />
                <div class="flex h-full flex-col items-start justify-center gap-0.5 text-left">
                    <p class="w-full text-3xl font-bold md:text-4xl">{songs[0].name}</p>
                    <p class="w-full text-xl text-slate-400 md:text-2xl">{songs[0].artist.name}</p>
                </div>
            </button>
        </div>
        <div class="flex w-full flex-initial flex-col items-start justify-center gap-2">
            <p class="block text-4xl font-bold">Songs</p>
            <div class="flex w-full flex-col items-center justify-between rounded-lg transition-colors duration-200 *:cursor-pointer">
                {#each songs.slice(1, 6) as song}
                    <button
                        onclick={async () => {
                            await play(song);
                        }}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            openCtxMenu(e, data.user?.id, song);
                        }}
                        class="flex h-auto w-full items-center justify-between gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                    >
                        <img src={song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")} alt="{song.name}'s Thumbnail" class="size-15 rounded-lg" />
                        <div class="flex w-full flex-col items-center justify-center text-left">
                            <MarqueeText class="w-10" text={song.name} />
                            <MarqueeText class="w-10 text-sm text-slate-400" text={song.artist.name} />
                        </div>
                        <p class="text-sm text-slate-400">{formatTime(song.duration ?? 0)}</p>
                    </button>
                {/each}
            </div>
        </div>
    </div>
    <SongListX user={data.user} songs={songs.slice(5)} class="mt-5" />
{/await}
