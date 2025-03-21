<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { previous, seekTo, setVolume, skip, store, togglePause } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import { fly } from "svelte/transition";
    import SolarAltArrowUpLinear from "~icons/solar/alt-arrow-up-linear";
    import SolarDownloadMinimalisticLinear from "~icons/solar/download-minimalistic-linear";
    import SolarMutedLinear from "~icons/solar/muted-linear";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRepeatLinear from "~icons/solar/repeat-linear";
    import SolarRepeatOneLinear from "~icons/solar/repeat-one-linear";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
    import SolarVolumeLinear from "~icons/solar/volume-linear";
    import SolarVolumeLoudLinear from "~icons/solar/volume-loud-linear";
    import SolarVolumeSmallLinear from "~icons/solar/volume-small-linear";
    import Button from "./Button.svelte";
    import MarqueeText from "./MarqueeText.svelte";
    import MobilePlayer from "./MobilePlayer.svelte";
    import Popover from "./Popover.svelte";
    import Slider from "./Slider.svelte";

    let { user }: { user: UserData } = $props();

    let showMobilePlayer: boolean = $state(false);

    // Update currentTime
    let currentTime: number = $state($store.currentTime);
    let isSeeking: boolean = $state(false);

    $effect(() => {
        if (!isSeeking) {
            currentTime = $store.currentTime;
        }
    });

    function handleSeek(value: number) {
        isSeeking = true;
        seekTo(value);
        isSeeking = false;
    }

    // Update volume
    let volume: number = $state(100);
    function handleVol(value: number) {
        setVolume(value);
    }
</script>

{#if showMobilePlayer}
    <MobilePlayer bind:show={showMobilePlayer} />
{/if}

<div id="player" class="flex size-full h-15 w-full items-center justify-between rounded-lg px-8 md:px-5">
    <div class="flex items-center justify-center gap-2 transition-opacity">
        <Button
            class="size-8 bg-slate-900 p-2 md:hidden {$store.state === 'unstarted' ? 'pointer-events-none opacity-0' : 'opacity-100'}"
            size=""
            onclick={() => (showMobilePlayer = true)}
        >
            <SolarAltArrowUpLinear class="size-full" />
        </Button>
        <div
            class="size-10 rounded-lg bg-slate-900 bg-cover transition-all md:size-15"
            style="background-image: url({$store.state !== 'unstarted' ? $store.meta?.thumbnails[0].url : ''});"
        ></div>
        {#if $store.state === "unstarted"}
            <div class="flex max-w-40 flex-col items-start justify-center gap-2">
                <span class="h-3 w-40 rounded-lg bg-slate-900 md:h-4"></span>
                <span class="h-3 w-40 rounded-lg bg-slate-900 md:h-4"></span>
            </div>
        {:else}
            <div in:fly={{ duration: 100 }} class="flex max-w-40 flex-col items-start justify-center">
                <MarqueeText text={$store.meta?.name || ""} class="text-sm font-semibold" />
                <span class="w-20 truncate text-xs text-slate-400 md:w-40">{$store.meta?.artist.name}</span>
            </div>
        {/if}
    </div>

    <div
        class="flex flex-col items-center justify-center gap-1 transition-all"
        class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
        class:pointer-events-none={$store.state === "unstarted"}
    >
        <div class="flex items-center justify-center gap-2 transition-all *:cursor-pointer md:gap-4">
            <!-- Previous -->
            <button onclick={previous} class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5">
                <SolarSkipPreviousBold class="size-full" />
            </button>

            <!-- Play/Pause -->
            <button class="size-8 transition-colors duration-200 hover:text-sky-500 md:size-10" onclick={togglePause}>
                {#if $store.state === "playing"}
                    <SolarPauseCircleBold class="size-full" />
                {:else}
                    <SolarPlayCircleBold class="size-full" />
                {/if}
            </button>

            <!-- Next -->
            <button onclick={skip} class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5">
                <SolarSkipNextBold class="size-full" />
            </button>
        </div>
        <div class="hidden items-center justify-center gap-2 md:flex">
            <p class="text-xs text-slate-400">{formatTime(currentTime)}</p>
            <Slider max={$store.totalDuration} value={currentTime} class="w-20 md:w-50 lg:w-80" onChange={handleSeek} />
            <p class="text-xs text-slate-400">{formatTime($store.totalDuration)}</p>
        </div>
    </div>

    <div
        class="hidden items-center justify-center gap-2 transition-all *:cursor-pointer md:flex md:gap-4"
        class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
        class:pointer-events-none={$store.state === "unstarted"}
    >
        <!-- Volume -->
        <Popover side="top">
            {#snippet trigger()}
                <span class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5">
                    {#if volume === 0}
                        <SolarMutedLinear class="size-full" />
                    {:else if volume < 50 && volume > 20}
                        <SolarVolumeSmallLinear class="size-full" />
                    {:else if volume < 20}
                        <SolarVolumeLinear class="size-full" />
                    {:else}
                        <SolarVolumeLoudLinear class="size-full" />
                    {/if}
                </span>
            {/snippet}
            {#snippet content()}
                <Slider bind:value={volume} class="w-40" onChange={handleVol} />
            {/snippet}
        </Popover>

        <!-- Loop -->
        <button
            onclick={() => {
                switch ($store.loop) {
                    case "none":
                        $store.loop = "single";
                        break;
                    case "single":
                        $store.loop = "queue";
                        break;
                    case "queue":
                        $store.loop = "none";
                        break;
                }
            }}
            class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5"
        >
            {#if $store.loop === "none"}
                <SolarRepeatLinear class="size-full" />
            {:else if $store.loop === "single"}
                <SolarRepeatOneLinear class="size-full" />
            {:else}
                <SolarRepeatLinear class="size-full text-sky-500" />
            {/if}
        </button>

        <!-- Queue -->
        <button class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5">
            <SolarPlaylist2Linear class="size-full" />
        </button>

        <!-- Download -->
        <button class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5">
            <SolarDownloadMinimalisticLinear class="size-full" />
        </button>
    </div>

    <!-- Player Video Element (hidden) -->
    <div id="player-iframe" class="hidden opacity-0"></div>
</div>
