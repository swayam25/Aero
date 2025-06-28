<script lang="ts">
    import { createQueueActions, openCtxMenu } from "$lib/ctxmenu";
    import { previous, seekTo, skip, store, toggleLyrics, togglePause, toggleQueue } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import SolarMicrophoneLargeLinear from "~icons/solar/microphone-large-linear";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRepeatLinear from "~icons/solar/repeat-linear";
    import SolarRepeatOneLinear from "~icons/solar/repeat-one-linear";
    import SolarShuffleLinear from "~icons/solar/shuffle-linear";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
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

    function handleContextMenu(e: MouseEvent) {
        if ($store.state === "unstarted" || !$store.meta) return;
        e.preventDefault();
        const actions = createQueueActions($store.meta);
        openCtxMenu(e, actions);
    }
</script>

<div class="flex h-full w-full flex-col justify-between p-4">
    <!-- Main Content -->
    <div class="flex flex-1 flex-col items-center justify-center gap-8">
        <!-- Album Art and Song Info -->
        <div class="flex flex-col items-center gap-4">
            <div oncontextmenu={handleContextMenu} role="button" tabindex="0" class="cursor-pointer">
                <img src={$store.meta?.thumbnails[0].url.replace("=w60-h60-l90-rj", "")} alt="thumbnail" class="size-72 rounded-2xl shadow-2xl" />
            </div>
            <div
                class="flex w-full max-w-sm cursor-pointer flex-col items-center text-center"
                oncontextmenu={handleContextMenu}
                role="button"
                tabindex="0"
            >
                <MarqueeText text={$store.meta?.name || ""} class="mb-1 text-xl font-bold text-white" />
                <span class="text-base text-slate-300">{$store.meta?.artist.name}</span>
            </div>
        </div>

        <!-- Player Controls -->
        <div
            class="flex w-full max-w-sm flex-col items-center gap-6 transition-all"
            class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
            class:pointer-events-none={$store.state === "unstarted"}
        >
            <!-- Progress Slider -->
            <div class="flex w-full items-center gap-3">
                <span class="min-w-10 text-center text-xs text-slate-300">{formatTime(currentTime)}</span>
                <Slider max={$store.totalDuration} value={currentTime} class="flex-1" onChange={handleSeek} />
                <span class="min-w-10 text-center text-xs text-slate-300">{formatTime($store.totalDuration)}</span>
            </div>

            <!-- Main Playback Controls -->
            <div class="flex items-center justify-center gap-6">
                <button onclick={previous} class="size-12 opacity-80 transition-opacity hover:opacity-100">
                    <SolarSkipPreviousBold class="size-full text-white" />
                </button>

                <button class="size-20 transition-colors duration-200 hover:text-sky-400" onclick={togglePause}>
                    {#if $store.state === "playing"}
                        <SolarPauseCircleBold class="size-full text-white" />
                    {:else}
                        <SolarPlayCircleBold class="size-full text-white" />
                    {/if}
                </button>

                <button onclick={skip} class="size-12 opacity-80 transition-opacity hover:opacity-100">
                    <SolarSkipNextBold class="size-full text-white" />
                </button>
            </div>
        </div>
    </div>

    <!-- Bottom Controls -->
    <div class="flex items-center justify-center gap-8 pb-4">
        <!-- Loop -->
        <button
            onclick={() => {
                switch ($store.loop) {
                    case "none":
                        $store.loop = "single";
                        break;
                    case "single":
                        $store.loop = $store.queue.length >= 2 ? "queue" : "none";
                        break;
                    case "queue":
                        $store.loop = "none";
                        break;
                }
            }}
            class="size-6 opacity-80 transition-opacity hover:opacity-100"
        >
            {#if $store.loop === "none"}
                <SolarRepeatLinear class="size-full text-white" />
            {:else if $store.loop === "single"}
                <SolarRepeatOneLinear class="size-full text-sky-500" />
            {:else}
                <SolarRepeatLinear class="size-full text-sky-500" />
            {/if}
        </button>

        <!-- Queue -->
        <button
            onclick={toggleQueue}
            class="size-6 opacity-80 transition-opacity not-disabled:hover:opacity-100"
            class:!cursor-not-allowed={$store.queue.length < 2}
            disabled={$store.queue.length < 2}
        >
            <SolarPlaylist2Linear class="size-full text-white" />
        </button>

        <!-- Lyrics -->
        <button
            onclick={toggleLyrics}
            class="size-6 opacity-80 transition-opacity not-disabled:hover:opacity-100"
            class:!cursor-not-allowed={!$store.meta}
            disabled={!$store.meta}
        >
            <SolarMicrophoneLargeLinear class="size-full text-white" />
        </button>

        <!-- Shuffle -->
        <button
            onclick={() => {
                $store.shuffle = !$store.shuffle;
            }}
            class="size-6 transition-opacity not-disabled:hover:opacity-100"
            class:opacity-80={!$store.shuffle}
            class:!cursor-not-allowed={$store.queue.length < 2}
            disabled={$store.queue.length < 2}
        >
            <SolarShuffleLinear class="size-full {$store.shuffle ? 'text-sky-500' : 'text-white'}" />
        </button>
    </div>
</div>
