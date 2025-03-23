<script lang="ts">
    import MarqueeText from "$lib/components/ui/MarqueeText.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import { playPlaylist, store } from "$lib/player";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import type { SongDetailed, SongFull } from "ytmusic-api";
    import HugeiconsCd from "~icons/hugeicons/cd";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let isPublic: boolean = $state(data.playlist.isPublic);
    let enableToggleBtn: boolean = $state(true);
    let songDetailedList: SongDetailed[] = [];

    function fetchSongDetailed(song: SongFull): SongDetailed {
        return {
            type: song.type,
            name: song.name,
            videoId: song.videoId,
            artist: song.artist,
            album: { name: "", albumId: "" },
            duration: song.duration,
            thumbnails: song.thumbnails
        };
    }

    async function togglePlaylistView() {
        enableToggleBtn = false;
        const resp = await fetch(`/api/playlist/${data.playlist.id}`, {
            method: "POST",
            body: JSON.stringify({ key: "toggle_view", value: { playlistID: data.playlist.id } }),
            headers: { "Content-Type": "application/json" }
        });
        if (resp.ok) {
            isPublic = (await resp.json()).isPublic;
        }
        setTimeout(() => {
            enableToggleBtn = true;
        }, 500);
    }
</script>

<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:justify-start">
    <div class="size-40 shrink-0 rounded-lg bg-slate-800 md:size-50"></div>
    <div class="flex flex-col items-center justify-center gap-2 md:items-start">
        <div class="flex items-center justify-center gap-2"></div>
        <div class="flex items-center justify-center gap-2 md:items-end">
            <h1
                class="text-4xl font-bold"
                class:md:text-6xl={data.playlist.name.length > 10 && data.playlist.name.length <= 20}
                class:md:text-8xl={data.playlist.name.length <= 10}
            >
                {data.playlist.name}
            </h1>
            {#if data.loginUser?.id === data.user.id}
                <Tooltip side="right" disabled={!enableToggleBtn}>
                    {#snippet trigger()}
                        <Switch size="md" checked={isPublic} disabled={!enableToggleBtn} onCheckedChange={togglePlaylistView} />
                    {/snippet}
                    {#snippet content()}
                        {isPublic ? "Public" : "Private"} Playlist
                    {/snippet}
                </Tooltip>
            {/if}
        </div>
        <p class="text-slate-400 md:text-lg">Created At {new Date(data.playlist.createdAt).toLocaleDateString()}</p>
    </div>
</div>

<div class="mt-2 flex flex-col items-start justify-center gap-2 md:mt-5 p-2" class:!mt-20={data.playlistSongs.length <= 0}>
    {#if data.playlistSongs.length <= 0}
        <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
            <div in:fade={{ duration: 100 }} class="flex flex-col items-center justify-center gap-2">
                <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
                <p class="text-lg text-slate-400 md:text-xl">Playlist is empty</p>
            </div>
        </div>
    {:else}
        {#each data.playlistSongs as song, idx}
            {#await song}
                <div
                    in:fade={{ duration: 100 }}
                    class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 p-2 transition-colors duration-200"
                >
                    <div class="flex size-10 items-center justify-center p-1 text-lg">
                        <span class="text-slate-200">{idx + 1}</span>
                    </div>
                    <div class="size-15 shrink-0 animate-pulse rounded-lg bg-slate-900"></div>
                    <div class="flex w-full flex-col items-start justify-center gap-2 text-left">
                        <div class="h-5 w-[80%] animate-pulse rounded-lg bg-slate-900 font-bold"></div>
                        <div class="h-5 w-[50%] animate-pulse truncate rounded-lg bg-slate-900"></div>
                    </div>
                </div>
            {:then song}
                {@const NaN = songDetailedList.push(fetchSongDetailed(song))}
                <button
                    onclick={async () => {
                        await playPlaylist(fetchSongDetailed(song), songDetailedList);
                    }}
                    in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                    out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                    oncontextmenu={(e) => {
                        e.preventDefault();
                        openCtxMenu(e, fetchSongDetailed(song), data.playlist, "playlistSong", data.loginUser?.id, data.user.id);
                    }}
                    class="flex w-full items-center justify-center gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                >
                    <div class="flex size-10 items-center justify-center p-1 text-lg">
                        {#if song.videoId === $store.meta?.videoId}
                            <span in:fade={{ duration: 100 }} class="size-full">
                                <HugeiconsCd class="size-full animate-spin text-sky-500" />
                            </span>
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
            {/await}
        {/each}
    {/if}
</div>
