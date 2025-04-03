<script lang="ts">
    import { previous, seekTo, skip, store, toggleLyrics, togglePause, toggleQueue } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import { expoOut } from "svelte/easing";
    import { fly } from "svelte/transition";
    import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
    import SolarMicrophoneLargeLinear from "~icons/solar/microphone-large-linear";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRepeatLinear from "~icons/solar/repeat-linear";
    import SolarRepeatOneLinear from "~icons/solar/repeat-one-linear";
    import SolarShuffleLinear from "~icons/solar/shuffle-linear";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
    import Button from "./ui/Button.svelte";
    import MarqueeText from "./ui/MarqueeText.svelte";
    import Slider from "./ui/Slider.svelte";

    interface Props {
        show: boolean;
    }
    let { show = $bindable() }: Props = $props();

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
</script>

<div
    transition:fly={{ duration: 500, easing: expoOut, x: 0, y: 100 }}
    class="fixed inset-0 z-200 h-screen w-screen bg-slate-950 bg-cover bg-center"
    style="background-image: url({$store.meta?.thumbnails[0].url.replace('=w60-h60-l90-rj', '')});"
>
    <div class="z-200 h-screen w-screen gap-10 bg-slate-950/80 bg-cover bg-center px-2 py-5 backdrop-blur-2xl *:not-first:mt-10">
        <div class="p8-5 flex w-full items-center justify-center">
            <Button
                class="absolute left-5 size-8 bg-slate-900 p-2 {$store.state === 'unstarted' ? 'pointer-events-none opacity-0' : 'opacity-100'}"
                size=""
                onclick={() => (show = false)}
            >
                <SolarAltArrowDownLinear class="size-full" />
            </Button>
            <p class="text-xl font-bold">Now Playing</p>
        </div>

        <div class="flex w-full flex-col items-center justify-center gap-10">
            <div class="flex w-full flex-col items-center justify-center gap-2">
                <img src={$store.meta?.thumbnails[0].url.replace("=w60-h60-l90-rj", "")} alt="thumbnail" class="size-80 rounded-lg" />
                <div class="flex w-80 flex-col items-start justify-center">
                    <MarqueeText text={$store.meta?.name || ""} class="text-lg font-semibold" />
                    <span class="text-sm text-slate-400">{$store.meta?.artist.name}</span>
                </div>
            </div>
            <div
                class="flex w-full flex-col items-center justify-center gap-2 transition-all"
                class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
                class:pointer-events-none={$store.state === "unstarted"}
            >
                <!-- Player Slider -->
                <div class="flex w-full items-center justify-center gap-2">
                    <p class="text-xs text-slate-400">{formatTime(currentTime)}</p>
                    <Slider max={$store.totalDuration} value={currentTime} class="w-80" onChange={handleSeek} />
                    <p class="text-xs text-slate-400">{formatTime($store.totalDuration)}</p>
                </div>
                <div class="flex items-center justify-center gap-4 transition-all *:cursor-pointer">
                    <!-- Previous -->
                    <button onclick={previous} class="size-8 opacity-80 transition-opacity hover:opacity-100">
                        <SolarSkipPreviousBold class="size-full" />
                    </button>

                    <!-- Play/Pause -->
                    <button class="size-16 transition-colors duration-200 hover:text-sky-500" onclick={togglePause}>
                        {#if $store.state === "playing"}
                            <SolarPauseCircleBold class="size-full" />
                        {:else}
                            <SolarPlayCircleBold class="size-full" />
                        {/if}
                    </button>

                    <!-- Next -->
                    <button onclick={skip} class="size-8 opacity-80 transition-opacity hover:opacity-100">
                        <SolarSkipNextBold class="size-full" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Other Controls -->
        <div
            class="flex items-center justify-center gap-4 transition-all *:cursor-pointer"
            class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
            class:pointer-events-none={$store.state === "unstarted"}
        >
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
                class="size-8 opacity-80 transition-opacity hover:opacity-100"
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
            <button
                onclick={toggleQueue}
                class="size-8 opacity-80 transition-opacity not-disabled:hover:opacity-100"
                class:!cursor-not-allowed={$store.queue.length < 2}
                disabled={$store.queue.length < 2}
            >
                <SolarPlaylist2Linear class="size-full" />
            </button>

            <!-- Lyrics -->
            <button
                onclick={toggleLyrics}
                class="size-8 opacity-80 transition-opacity not-disabled:hover:opacity-100"
                class:!cursor-not-allowed={!$store.meta}
                disabled={!$store.meta}
            >
                <SolarMicrophoneLargeLinear class="size-full" />
            </button>

            <!-- Shuffle -->
            <button
                onclick={() => {
                    $store.shuffle = !$store.shuffle;
                }}
                class="size-8 transition-opacity not-disabled:hover:opacity-100"
                class:opacity-80={!$store.shuffle}
                class:!cursor-not-allowed={$store.queue.length < 2}
                disabled={$store.queue.length < 2}
            >
                <SolarShuffleLinear class="size-full {$store.shuffle ? 'text-sky-500' : ''}" />
            </button>
        </div>
    </div>
</div>
