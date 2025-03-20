<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { setVolume, skip, store, togglePause } from "$lib/player";
    import { Slider } from "bits-ui";
    import SolarMutedLinear from "~icons/solar/muted-linear";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarRepeatLinear from "~icons/solar/repeat-linear";
    import SolarRepeatOneLinear from "~icons/solar/repeat-one-linear";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
    import SolarVolumeLinear from "~icons/solar/volume-linear";
    import SolarVolumeLoudLinear from "~icons/solar/volume-loud-linear";
    import SolarVolumeSmallLinear from "~icons/solar/volume-small-linear";
    import Popover from "./Popover.svelte";

    let { user }: { user: UserData } = $props();

    let volume: number = $state(100);
    $effect(() => {
        setVolume(volume);
    });
</script>

<div id="player" class="flex size-full h-15 w-full items-center justify-between rounded-lg px-5">
    <div class="flex items-center justify-center gap-2 transition-opacity" class:opacity-0={$store.state === "unstarted"}>
        <div
            class="size-10 rounded-lg bg-slate-900 bg-cover transition-all md:size-15"
            style="background-image: url({$store.meta?.thumbnails[0].url});"
        ></div>
        <div class="ml-2 flex flex-col items-start justify-center">
            <span class="w-20 truncate text-sm font-semibold md:w-50">{$store.meta?.name}</span>
            <span class="w-20 truncate text-xs text-slate-400 md:w-50">{$store.meta?.artist.name}</span>
        </div>
    </div>

    <div
        class="flex items-center justify-center gap-3 transition-all *:cursor-pointer md:gap-4"
        class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
        class:pointer-events-none={$store.state === "unstarted"}
    >
        <!-- Previous -->
        <button class="size-4 opacity-80 transition-opacity hover:opacity-100 md:size-5">
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

    <div
        class="flex w-20 items-center justify-center gap-3 transition-all *:cursor-pointer md:w-50 md:gap-4"
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
                <div class="group w-40 p-1">
                    <Slider.Root type="single" bind:value={volume} class="relative flex w-full touch-none items-center select-none">
                        {#snippet children()}
                            <span class="relative h-1 w-full grow cursor-pointer overflow-hidden rounded-full bg-slate-800">
                                <Slider.Range class="absolute h-full bg-slate-200 transition-colors duration-200 group-hover:bg-sky-500" />
                            </span>
                            <Slider.Thumb index={0} class="size-3 cursor-pointer rounded-full bg-slate-200 transition-colors duration-200" />
                        {/snippet}
                    </Slider.Root>
                </div>
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
    </div>

    <!-- Player Video Element (hidden) -->
    <div id="player-iframe" class="hidden opacity-0"></div>
</div>
