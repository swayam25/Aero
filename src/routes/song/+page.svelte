<script lang="ts">
    import SongListX from "$lib/components/SongListX.svelte";
    import Popover from "$lib/components/ui/Popover.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import CtxButton from "$lib/ctxmenu/components/CtxButton.svelte";
    import { enhanceSong, fetchSongDetailed, play, store } from "$lib/player";
    import { playlistsCache } from "$lib/stores";
    import { formatTime } from "$lib/utils/time";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarCopyLinear from "~icons/solar/copy-linear";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let enhancedSong = $derived(enhanceSong(data.song));
    let openPlaylistPopover = $state(false);

    onMount(async () => {
        if (playlistsCache.isStale($playlistsCache)) {
            await playlistsCache.refresh();
        }
    });
</script>

<Seo
    title={data.song.name}
    description={`Listen to ${data.song.name} by ${data.song.artist.name}.\n\nDuration: ${formatTime(data.song.duration)}`}
    image={enhancedSong.thumbnail.LARGE}
/>

<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:justify-start">
    <div class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover md:size-50" style="background-image: url({enhancedSong.thumbnail.LARGE});"></div>
    <div class="flex flex-col items-start justify-center gap-2 text-left">
        <div class="flex flex-col items-start justify-center gap-2 text-left">
            <h1
                class="text-left text-2xl font-bold md:text-4xl"
                class:md:text-6xl={data.song.name.length > 10 && data.song.name.length <= 20}
                class:md:text-8xl={data.song.name.length <= 10}
            >
                {data.song.name}
            </h1>
            <div
                class="flex items-center justify-center gap-1 text-sm text-slate-400 [&>*:not(:first-child)]:before:mr-1 [&>*:not(:first-child)]:before:content-['•']"
            >
                <!-- Artist Name -->
                <p>
                    {data.song.artist.name.split(", ").splice(0, 5).join(", ")}
                </p>
                <!-- Duration -->
                <p>
                    {formatTime(data.song.duration)}
                </p>
            </div>
        </div>
        <div class="flex w-full items-center justify-between gap-5 md:w-fit md:flex-row-reverse md:justify-start">
            <div class="flex items-center justify-center gap-2">
                <!-- Copy Song Link -->
                <Tooltip side="bottom" content="Copy song link">
                    <div
                        role="button"
                        tabindex="0"
                        class="size-6 cursor-pointer opacity-80 transition-colors duration-200 hover:opacity-100"
                        onclick={() => {
                            const link = `${window.location.origin}/song?id=${data.song.videoId}`;
                            navigator.clipboard.writeText(link);
                            toast.success("Song link copied to clipboard");
                        }}
                        onkeydown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                const link = `${window.location.origin}/song?id=${data.song.videoId}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Song link copied to clipboard");
                            }
                        }}
                    >
                        <SolarCopyLinear class="size-full" />
                    </div>
                </Tooltip>
                {#if data.user && $playlistsCache.playlists}
                    <!-- Add to Playlist -->
                    <Popover arrow side="bottom" bind:open={openPlaylistPopover} title="Add to Playlist">
                        {#snippet trigger()}
                            <div class="size-6 cursor-pointer opacity-80 transition-colors duration-200 hover:opacity-100">
                                <SolarPlaylist2Linear class="size-full" />
                            </div>
                        {/snippet}
                        {#snippet content()}
                            {#if data.user}
                                {#if !$playlistsCache.playlists}
                                    <CtxButton disabled>
                                        <SolarConfoundedCircleLinear class="size-5 shrink-0" />
                                        <span class="flex-1 text-left">Login to add to playlists</span>
                                    </CtxButton>
                                {:else if $playlistsCache.playlists.length === 0}
                                    <CtxButton disabled>
                                        <SolarConfoundedCircleLinear class="size-5 shrink-0" />
                                        <span class="flex-1 text-left">No playlists found</span>
                                    </CtxButton>
                                {:else}
                                    {#each $playlistsCache.playlists as playlist}
                                        <CtxButton
                                            onclick={async () => {
                                                openPlaylistPopover = false;
                                                try {
                                                    const resp = await fetch(`/api/playlist/${playlist.id}`, {
                                                        body: JSON.stringify({
                                                            key: "add_song",
                                                            value: {
                                                                playlistID: playlist.id,
                                                                songID: data.song.videoId,
                                                                songCover: enhancedSong.thumbnail.MEDIUM,
                                                            },
                                                        }),
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                    });

                                                    const respData = await resp.json();
                                                    if (resp.ok) {
                                                        toast.success(`Added to ${playlist.name}`);
                                                    } else {
                                                        toast.error(respData.error);
                                                    }
                                                } catch (error) {
                                                    toast.error("Failed to add song to playlist");
                                                }
                                            }}
                                            class="items-center justify-center"
                                        >
                                            <div
                                                class="size-10 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900"
                                                style="background-image: url({playlist.cover || ''});"
                                            ></div>
                                            <span class="flex-1 text-left">{playlist.name}</span>
                                        </CtxButton>
                                    {/each}
                                {/if}
                            {/if}
                        {/snippet}
                    </Popover>
                {/if}
            </div>
            <div class="flex items-center justify-center gap-2">
                <!-- Play/Pause -->
                <button
                    class="size-15 cursor-pointer transition-colors duration-200 hover:text-sky-500"
                    onclick={async () => await play(fetchSongDetailed(data.song), data.user?.id)}
                >
                    {#if $store.state === "playing" && $store.meta?.videoId === data.song.videoId}
                        <SolarPauseCircleBold class="size-full" />
                    {:else}
                        <SolarPlayCircleBold class="size-full" />
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Related Songs Section -->
<div class="mt-8 text-left">
    <h2 class="text-3xl font-bold md:text-4xl">Related Songs</h2>
    {#await data.relatedSongs}
        <SongListX skeleton skeletonCount={8} />
    {:then relatedSongs}
        <div in:fade={{ duration: 100 }}>
            <SongListX user={data.user} songs={relatedSongs} />
        </div>
    {/await}
</div>

<!-- Top margin/padding is not needed here as SongListX alr comes with padding -->

<!-- More From Artist Section -->
<div class="text-left">
    <h2 class="text-3xl font-bold md:text-4xl">More From Artists</h2>
    {#await data.moreFromArtist}
        <SongListX skeleton skeletonCount={8} />
    {:then moreFromArtist}
        <div in:fade={{ duration: 100 }}>
            <SongListX user={data.user} songs={moreFromArtist} />
        </div>
    {/await}
</div>
