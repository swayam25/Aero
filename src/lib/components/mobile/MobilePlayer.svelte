<script lang="ts">
    import { createSongActions, openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { previous, seekTo, skip, store, togglePause } from "$lib/player";
    import { userRoomStore } from "$lib/stores/userRoom";
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
        seekTo(value, user?.id);
        togglePause(user?.id);
        isSeeking = false;
    }

    function handleContextMenu(e: MouseEvent) {
        if ($store.state === "unstarted" || !$store.meta) return;
        e.preventDefault();
        const actions = createSongActions($store.meta, user?.id);
        openCtxMenu(e, actions);
    }

    // Room
    let isRoomHost: boolean = $derived.by(() => {
        if ($userRoomStore && user) {
            return $userRoomStore.hostUserId === user.id;
        } else {
            return true;
        }
    });
</script>

<div class="flex h-full w-full flex-col justify-between">
    <!-- Main Content -->
    <div class="flex flex-1 flex-col items-center justify-center gap-8">
        <!-- Album Art and Song Info -->
        <div class="flex flex-col items-center gap-4">
            <div oncontextmenu={handleContextMenu} role="button" tabindex="0" class="cursor-pointer">
                <div
                    class="size-72 rounded-2xl bg-slate-800 bg-cover shadow-2xl"
                    style="background-image: url({$store.meta?.thumbnail.XLARGE})"
                ></div>
            </div>
            <div class="w-full max-w-sm cursor-pointer text-left" oncontextmenu={handleContextMenu} role="button" tabindex="0">
                <MarqueeText pause={$store.state !== "playing"} text={$store.meta?.name || ""} class="mb-1 text-xl font-bold text-white" />
                <span class="text-base text-slate-300">{$store.meta?.artist.name}</span>
            </div>
        </div>

        <!-- Player Controls -->
        <div
            class="flex w-full max-w-sm flex-col items-center gap-6 transition-all"
            class:opacity-80={$store.state === "buffering" || $store.state === "unstarted" || !isRoomHost}
            class:pointer-events-none={$store.state === "unstarted" || !isRoomHost}
        >
            <!-- Progress Slider -->
            <div class="flex w-full items-center gap-3">
                <span class="min-w-10 text-center text-xs text-slate-300">{formatTime(currentTime)}</span>
                <Slider max={$store.totalDuration} value={currentTime} class="flex-1" onChange={$store.player?.pauseVideo} onStop={handleSeek} />
                <span class="min-w-10 text-center text-xs text-slate-300">{formatTime($store.totalDuration)}</span>
            </div>

            <!-- Main Playback Controls -->
            <div class="flex items-center justify-center gap-6">
                <button onclick={() => previous(user?.id)} class="size-12 opacity-80 transition-opacity hover:opacity-100">
                    <SolarSkipPreviousBold class="size-full text-white" />
                </button>

                <button class="size-20 transition-colors duration-200 hover:text-sky-400" onclick={() => togglePause(user?.id)}>
                    {#if $store.state === "playing"}
                        <SolarPauseCircleBold class="size-full text-white" />
                    {:else}
                        <SolarPlayCircleBold class="size-full text-white" />
                    {/if}
                </button>

                <button onclick={() => skip(user?.id)} class="size-12 opacity-80 transition-opacity hover:opacity-100">
                    <SolarSkipNextBold class="size-full text-white" />
                </button>
            </div>
        </div>
    </div>

    <!-- Bottom Controls -->
    <PlayerButtons {user} showVolume={false} iconSize="size-6" gap="gap-8" py="py-4" />
</div>
