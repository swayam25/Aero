<script lang="ts">
    import { createQueueActions, openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { previous, seekTo, skip, store, togglePause } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
    import PlayerButtons from "../PlayerButtons.svelte";
    import MarqueeText from "../ui/MarqueeText.svelte";
    import Slider from "../ui/Slider.svelte";

    interface Props {
        user: UserData | null;
        show: boolean;
    }
    let { user, show = $bindable() }: Props = $props();

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
    <PlayerButtons {user} showVolume={false} iconSize="size-6" gap="gap-8" py="py-4" />
</div>
