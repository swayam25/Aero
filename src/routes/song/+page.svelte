<script lang="ts">
    import SongListX from "$lib/components/SongListX.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { fetchSongDetailed, play, store } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<Seo
    title={data.song.name}
    description={`Listen to ${data.song.name} by ${data.song.artist.name}`}
    image={data.song.thumbnails[0].url.replace("=w60-h60-l90-rj", "")}
/>
<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:justify-start">
    <div
        class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover md:size-50"
        style="background-image: url({data.song.thumbnails[0].url.replace('=w60-h60-l90-rj', '')});"
    ></div>
    <div class="flex flex-col items-center justify-center gap-2 md:items-start">
        <div class="flex items-center justify-center gap-2"></div>
        <div class="flex items-center justify-center gap-2 md:items-end">
            <h1
                class="text-2xl font-bold md:text-4xl"
                class:md:text-6xl={data.song.name.length > 10 && data.song.name.length <= 20}
                class:md:text-8xl={data.song.name.length <= 10}
            >
                {data.song.name}
            </h1>
        </div>
        <div class="flex items-start justify-center gap-2">
            <p class="text-sm text-slate-400 md:w-[50vw]">
                {data.song.artist.name.split(", ").splice(0, 5).join(", ")}
            </p>
        </div>
        <div class="flex items-center justify-center gap-2">
            <!-- Play/Pause -->
            <button
                class="size-10 cursor-pointer transition-colors duration-200 hover:text-sky-500 md:size-15"
                onclick={async () => await play(fetchSongDetailed(data.song))}
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
