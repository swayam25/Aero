<script lang="ts">
    import { page } from "$app/state";
    import Search from "$lib/components/Search.svelte";
    import SongListX from "$lib/components/SongListX.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { createSongActions, openCtxMenu } from "$lib/ctxmenu";
    import { enhanceSong, play } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import { fade } from "svelte/transition";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<Seo title={page.url.searchParams.get("q") || "Search"} />

<div class="pb-5 md:hidden">
    <Search />
</div>

{#if data.songs}
    {#await data.songs}
        <div class="flex h-min flex-col items-stretch justify-between gap-5 md:flex-row">
            <div class="flex w-full min-w-2/5 flex-col items-center justify-center gap-2 md:items-start">
                <p class="hidden text-4xl font-bold md:block">Top Result</p>
                <div class="flex size-full flex-col items-start justify-between gap-2 rounded-lg bg-slate-800 p-5">
                    <div class="size-30 shrink-0 animate-pulse rounded-lg bg-slate-900 md:size-45"></div>
                    <div class="flex size-full flex-col items-start justify-start gap-1">
                        <div class="h-10 w-full animate-pulse rounded-lg bg-slate-900"></div>
                        <div class="h-10 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                    </div>
                </div>
            </div>
            <div class="size-full flex-col items-start justify-center gap-2 md:flex">
                <p class="hidden text-4xl font-bold md:block">Songs</p>
                <div class="flex size-full flex-col items-center justify-start gap-2">
                    {#each Array(5) as _}
                        <div class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 p-2 transition-colors duration-200">
                            <div class="size-15 animate-pulse rounded-lg bg-slate-900"></div>
                            <div class="flex w-full flex-col items-start justify-center gap-2 text-left">
                                <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900"></div>
                                <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        <SongListX skeleton />
    {:then songs}
        <div in:fade={{ duration: 100 }} class="flex h-min min-w-0 flex-col items-stretch justify-between gap-5 overflow-x-hidden md:flex-row">
            <div class="flex w-full min-w-2/5 flex-auto flex-col items-start justify-center gap-2">
                <p class="block text-4xl font-bold">Top Result</p>
                {#if songs[0]}
                    {@const firstSong = enhanceSong(songs[0])}
                    <button
                        onclick={async () => {
                            await play(songs[0], data.user?.id);
                        }}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            const actions = createSongActions(songs[0], data.user?.id);
                            openCtxMenu(e, actions);
                        }}
                        class="group flex size-full cursor-pointer flex-col items-start justify-between gap-2 rounded-lg bg-slate-800 p-5 transition-colors duration-200 hover:bg-slate-700"
                    >
                        <div
                            class="size-30 shrink-0 rounded-lg bg-slate-900 bg-cover transition-colors duration-200 group-hover:bg-slate-800 md:size-45"
                            style="background-image: url({firstSong.thumbnail.LARGE});"
                        ></div>
                        <div class="flex size-full flex-col items-start justify-center gap-1 text-left">
                            <p class="w-full text-3xl font-medium md:text-4xl">{songs[0].name}</p>
                            <p class="w-full text-xl text-slate-400 md:text-2xl">{songs[0].artist.name}</p>
                        </div>
                    </button>
                {/if}
            </div>
            <div class="justify flex w-full min-w-0 flex-auto flex-col items-start gap-2 overflow-hidden">
                <p class="block text-4xl font-bold">Songs</p>
                <div class="flex w-full flex-col items-center justify-between rounded-lg transition-colors duration-200 *:cursor-pointer">
                    {#each songs.slice(1, 6) as song}
                        {@const enhanced = enhanceSong(song)}
                        <button
                            onclick={async () => {
                                await play(song, data.user?.id);
                            }}
                            oncontextmenu={(e) => {
                                e.preventDefault();
                                const actions = createSongActions(song, data.user?.id);
                                openCtxMenu(e, actions);
                            }}
                            class="group flex h-auto w-full min-w-0 items-center justify-between gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                        >
                            <div
                                class="size-15 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900"
                                style="background-image: url({enhanced.thumbnail.SMALL});"
                            ></div>
                            <div class="flex-truncate text-left">
                                <p class="w-full max-w-full truncate" title={song.name}>{song.name}</p>
                                <p class="w-full max-w-full truncate text-sm text-slate-400" title={song.artist.name}>{song.artist.name}</p>
                            </div>
                            <p class="shrink-0 text-sm text-slate-400">{formatTime(song.duration ?? 0)}</p>
                        </button>
                    {/each}
                </div>
            </div>
        </div>
        <SongListX user={data.user} songs={songs.slice(5)} />
    {/await}
{/if}
