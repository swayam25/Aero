<script lang="ts">
    import { createQueueActions, openCtxMenu } from "$lib/ctxmenu";
    import { previous, seekTo, setVolume, skip, store, toggleLyrics, togglePause, toggleQueue } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import SolarMicrophoneLargeLinear from "~icons/solar/microphone-large-linear";
    import SolarMutedLinear from "~icons/solar/muted-linear";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRepeatLinear from "~icons/solar/repeat-linear";
    import SolarRepeatOneLinear from "~icons/solar/repeat-one-linear";
    import SolarShuffleLinear from "~icons/solar/shuffle-linear";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
    import SolarVolumeLinear from "~icons/solar/volume-linear";
    import SolarVolumeLoudLinear from "~icons/solar/volume-loud-linear";
    import SolarVolumeSmallLinear from "~icons/solar/volume-small-linear";
    import MarqueeText from "./ui/MarqueeText.svelte";
    import Popover from "./ui/Popover.svelte";
    import Slider from "./ui/Slider.svelte";

    let {
        onSongInfoClick = () => {}
    }: {
        onSongInfoClick?: () => void;
    } = $props();

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
    $effect(() => {
        setVolume(volume);
    });
    function handleVol(value: number) {
        if (localStorage) localStorage.setItem("volume", value.toString());
        setVolume(value);
    }
    onMount(() => {
        if (localStorage) {
            volume = localStorage.getItem("volume") ? Number(localStorage.getItem("volume")) : 100;
        }
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (document.activeElement && document.activeElement.tagName.toLowerCase() === "input") {
                return;
            }
            if ($store.meta) {
                if (e.key === " " || e.key === "k") {
                    e.preventDefault();
                    togglePause();
                }
            }
        });
    });
</script>

<div id="player" class="relative flex h-15 w-full items-center justify-end gap-2 rounded-lg px-4 sm:justify-center">
    <!-- Song Info -->
    <button
        class="absolute left-0 flex cursor-pointer items-center justify-center gap-2 transition-opacity md:left-5"
        onclick={() => {
            if ($store.state !== "unstarted") {
                onSongInfoClick();
            }
        }}
        oncontextmenu={(e) => {
            if ($store.state === "unstarted") return;
            e.preventDefault();
            if ($store.meta) {
                const actions = createQueueActions($store.meta);
                openCtxMenu(e, actions);
            }
        }}
        tabindex="0"
    >
        <div
            class="size-15 rounded-l-lg bg-slate-800 bg-cover transition-all md:rounded-lg md:bg-slate-900"
            style="background-image: url({$store.state !== 'unstarted' ? $store.meta?.thumbnails[0].url.replace('=w60-h60-l90-rj', '') : ''});"
        ></div>
        {#if $store.state === "unstarted"}
            <div class="flex max-w-40 flex-col items-start justify-center gap-2">
                <span class="h-3 w-40 rounded-lg bg-slate-800 md:h-4 md:bg-slate-900"></span>
                <span class="h-3 w-40 rounded-lg bg-slate-800 md:h-4 md:bg-slate-900"></span>
            </div>
        {:else}
            <div in:fly={{ duration: 100 }} class="flex max-w-40 flex-col items-start justify-center text-left">
                <MarqueeText text={$store.meta?.name || ""} class="text-sm font-semibold" />
                <span class="w-20 truncate text-xs text-slate-400 md:w-40">{$store.meta?.artist.name}</span>
            </div>
        {/if}
    </button>

    <!-- Main Controls -->
    <div
        class="flex flex-col items-center justify-center gap-1 transition-all"
        class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
        class:pointer-events-none={$store.state === "unstarted"}
    >
        <div class="flex items-center justify-center gap-2 transition-all *:cursor-pointer">
            <!-- Previous -->
            <button onclick={previous} class="size-5 cursor-pointer opacity-80 transition-opacity hover:opacity-100">
                <SolarSkipPreviousBold class="size-full" />
            </button>

            <!-- Play/Pause -->
            <button class="size-10 cursor-pointer transition-colors duration-200 hover:text-sky-500" onclick={togglePause}>
                {#if $store.state === "playing"}
                    <SolarPauseCircleBold class="size-full" />
                {:else}
                    <SolarPlayCircleBold class="size-full" />
                {/if}
            </button>

            <!-- Next -->
            <button
                onclick={skip}
                class="size-5 cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100"
                class:!cursor-not-allowed={$store.queue.length < 2}
                disabled={$store.queue.length < 2}
            >
                <SolarSkipNextBold class="size-full" />
            </button>
        </div>
        <!-- Player Slider -->
        <div class="hidden items-center justify-center gap-2 md:flex">
            <p class="text-xs text-slate-400">{formatTime(currentTime)}</p>
            <Slider max={$store.totalDuration} value={currentTime} class="w-20 md:w-40 lg:w-80" onChange={handleSeek} />
            <p class="text-xs text-slate-400">{formatTime($store.totalDuration)}</p>
        </div>
    </div>

    <!-- Other Controls -->
    <div
        class="absolute right-5 hidden items-center justify-center gap-4 transition-all *:cursor-pointer sm:flex"
        class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
        class:pointer-events-none={$store.state === "unstarted"}
    >
        <!-- Volume -->
        <Popover side="top">
            {#snippet trigger()}
                <span class="size-5 cursor-pointer opacity-80 transition-opacity hover:opacity-100">
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
                        $store.loop = $store.queue.length >= 2 ? "queue" : "none";
                        break;
                    case "queue":
                        $store.loop = "none";
                        break;
                }
            }}
            class="size-5 cursor-pointer transition-opacity hover:opacity-100"
            class:opacity-80={$store.loop === "none"}
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
            class="size-5 cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100"
            class:!cursor-not-allowed={$store.queue.length < 2}
            disabled={$store.queue.length < 2}
        >
            <SolarPlaylist2Linear class="size-full" />
        </button>

        <!-- Lyrics -->
        <button
            onclick={toggleLyrics}
            class="size-5 cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100"
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
            class="size-5 cursor-pointer transition-opacity not-disabled:hover:opacity-100"
            class:opacity-80={!$store.shuffle}
            class:!cursor-not-allowed={$store.queue.length < 2}
            disabled={$store.queue.length < 2}
        >
            <SolarShuffleLinear class="size-full {$store.shuffle ? 'text-sky-500' : ''}" />
        </button>
    </div>

    <!-- Player Video Element (hidden) -->
    <div id="player-iframe" class="hidden opacity-0"></div>
</div>
