<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { getLocalStorageVolume, setLoop, setShuffle, setVolume, store, toggleLyrics, togglePause, toggleQueue } from "$lib/player";
    import { userRoomStore } from "$lib/stores/userRoom";
    import { cn } from "$lib/utils/cn";
    import { onMount } from "svelte";
    import SolarMicrophoneLargeLinear from "~icons/solar/microphone-large-linear";
    import SolarMutedLinear from "~icons/solar/muted-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRepeatLinear from "~icons/solar/repeat-linear";
    import SolarRepeatOneLinear from "~icons/solar/repeat-one-linear";
    import SolarShuffleLinear from "~icons/solar/shuffle-linear";
    import SolarVolumeLinear from "~icons/solar/volume-linear";
    import SolarVolumeLoudLinear from "~icons/solar/volume-loud-linear";
    import SolarVolumeSmallLinear from "~icons/solar/volume-small-linear";
    import Popover from "./ui/Popover.svelte";
    import Slider from "./ui/Slider.svelte";

    interface Props {
        user: UserData | null;
        onVolumeClick?: () => void;
        onLoopClick?: () => void;
        onQueueClick?: () => void;
        onLyricsClick?: () => void;
        onShuffleClick?: () => void;
        showVolume?: boolean;
        iconSize?: string;
        gap?: string;
        py?: string;
        class?: string;
    }

    let {
        user,
        onVolumeClick,
        onLoopClick,
        onQueueClick,
        onLyricsClick,
        onShuffleClick,
        showVolume = true,
        iconSize = "size-6",
        gap = "gap-8",
        py = "py-4",
        class: className = "",
    }: Props = $props();

    // Room
    let isRoomHost: boolean = $derived.by(() => {
        if ($userRoomStore && user) {
            return $userRoomStore.hostUserId === user.id;
        } else {
            return true;
        }
    });

    // Update volume
    let volume: number = $state(100);
    function handleVol(value: number) {
        if (onVolumeClick) onVolumeClick();
        setVolume(value);
    }
    onMount(() => {
        volume = getLocalStorageVolume();
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (isRoomHost) {
                if (document.activeElement && document.activeElement.tagName.toLowerCase() === "input") {
                    return;
                }
                if ($store.meta) {
                    if (e.key === " " || e.key === "k") {
                        e.preventDefault();
                        togglePause(user?.id);
                    }
                }
            }
        });
        return () => {
            document.removeEventListener("keydown", () => {});
        };
    });

    // Loop
    function handleLoop() {
        if (onLoopClick) return onLoopClick();
        switch ($store.loop) {
            case "none":
                setLoop("single", user?.id);
                break;
            case "single":
                setLoop($store.queue.length >= 2 ? "queue" : "none", user?.id);
                break;
            case "queue":
                setLoop("none", user?.id);
                break;
        }
    }

    // Queue
    function handleQueue() {
        if (onQueueClick) onQueueClick();
        toggleQueue();
    }

    // Lyrics
    function handleLyrics() {
        if (onLyricsClick) onLyricsClick();
        toggleLyrics();
    }

    // Shuffle
    function handleShuffle() {
        if (onShuffleClick) onShuffleClick();
        setShuffle(!$store.shuffle, user?.id);
    }
</script>

<div
    class={cn("flex items-center justify-center", gap, py, className)}
    class:opacity-80={$store.state === "buffering" || $store.state === "unstarted" || !$store.meta}
    class:pointer-events-none={$store.state === "unstarted" || !$store.meta}
>
    {#if showVolume}
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
    {/if}

    <!-- Loop -->
    <button
        onclick={handleLoop}
        class={cn(iconSize, "cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100")}
        disabled={!isRoomHost}
        class:!cursor-not-allowed={!isRoomHost}
    >
        {#if $store.loop === "none"}
            <SolarRepeatLinear class="size-full text-slate-50" />
        {:else if $store.loop === "single"}
            <SolarRepeatOneLinear class="size-full text-sky-500" />
        {:else}
            <SolarRepeatLinear class="size-full text-sky-500" />
        {/if}
    </button>

    <!-- Queue -->
    <button
        onclick={handleQueue}
        class={cn(iconSize, "cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100")}
        class:!cursor-not-allowed={$store.queue.length < 2}
        disabled={$store.queue.length < 2}
    >
        <SolarPlaylist2Linear class="size-full text-slate-50" />
    </button>

    <!-- Lyrics -->
    <button
        onclick={handleLyrics}
        class={cn(iconSize, "cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100")}
        class:!cursor-not-allowed={!$store.meta}
        disabled={!$store.meta}
    >
        <SolarMicrophoneLargeLinear class="size-full text-slate-50" />
    </button>

    <!-- Shuffle -->
    <button
        onclick={handleShuffle}
        class={cn(iconSize, "cursor-pointer transition-opacity not-disabled:hover:opacity-100")}
        class:opacity-80={!$store.shuffle}
        disabled={$store.queue.length < 2 || !isRoomHost}
        class:!cursor-not-allowed={$store.queue.length < 2 || !isRoomHost}
    >
        <SolarShuffleLinear class="size-full {$store.shuffle ? 'text-sky-500' : 'text-slate-50'}" />
    </button>
</div>
