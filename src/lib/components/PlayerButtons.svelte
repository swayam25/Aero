<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { setVolume, store, toggleLyrics, togglePause, toggleQueue } from "$lib/player";
    import { cn } from "$lib/utils/cn";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import SolarDownloadMinimalisticLinear from "~icons/solar/download-minimalistic-linear";
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
        onDownloadClick?: () => void;
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
        onDownloadClick,
        showVolume = true,
        iconSize = "size-6",
        gap = "gap-8",
        py = "py-4",
        class: className = "",
    }: Props = $props();

    // Update volume
    let volume: number = $state(100);
    $effect(() => {
        setVolume(volume);
    });
    function handleVol(value: number) {
        if (onVolumeClick) onVolumeClick();
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

    // Loop
    function handleLoop() {
        if (onLoopClick) return onLoopClick();
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
        $store.shuffle = !$store.shuffle;
    }

    // Download
    let downloadLoading: boolean = $state(false);
    async function handleDownload() {
        if (onDownloadClick) onDownloadClick();
        if (!user) {
            toast.warning("Login to download songs");
            return;
        }
        if (!$store.meta || !$store.meta.videoId) return;

        downloadLoading = true;
        const id = $store.meta.videoId;
        toast.promise(
            (async () => {
                const response = await fetch(`/api/download?id=${encodeURIComponent(id)}`);
                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Unknown error");
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = ($store.meta?.name || "song") + ".m4a";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => window.URL.revokeObjectURL(url), 100);
            })(),
            {
                loading: "Downloading...",
                success: () => {
                    downloadLoading = false;
                    return "Download complete!";
                },
                error: (err: any) => {
                    downloadLoading = false;
                    return err?.message || "Unknown error";
                },
                description: "Please be patient, this may take a while.",
            },
        );
    }
</script>

<div
    class={cn("flex items-center justify-center", gap, py, className)}
    class:opacity-80={$store.state === "buffering" || $store.state === "unstarted"}
    class:pointer-events-none={$store.state === "unstarted"}
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
    <button onclick={handleLoop} class={cn(iconSize, "cursor-pointer opacity-80 transition-opacity hover:opacity-100")}>
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
        onclick={handleQueue}
        class={cn(iconSize, "cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100")}
        class:!cursor-not-allowed={$store.queue.length < 2}
        disabled={$store.queue.length < 2}
    >
        <SolarPlaylist2Linear class="size-full text-white" />
    </button>

    <!-- Lyrics -->
    <button
        onclick={handleLyrics}
        class={cn(iconSize, "cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100")}
        class:!cursor-not-allowed={!$store.meta}
        disabled={!$store.meta}
    >
        <SolarMicrophoneLargeLinear class="size-full text-white" />
    </button>

    <!-- Shuffle -->
    <button
        onclick={handleShuffle}
        class={cn(iconSize, "cursor-pointer transition-opacity not-disabled:hover:opacity-100")}
        class:opacity-80={!$store.shuffle}
        class:!cursor-not-allowed={$store.queue.length < 2}
        disabled={$store.queue.length < 2}
    >
        <SolarShuffleLinear class={`size-full ${$store.shuffle ? "text-sky-500" : "text-white"}`} />
    </button>

    <!-- Download -->
    <button
        class="size-5 cursor-pointer opacity-80 transition-opacity not-disabled:hover:opacity-100"
        class:!cursor-progress={downloadLoading}
        class:!cursor-not-allowed={!$store.meta || !$store.meta.videoId}
        disabled={downloadLoading || !$store.meta || !$store.meta.videoId}
        onclick={handleDownload}
    >
        <SolarDownloadMinimalisticLinear class="size-full" />
    </button>
</div>
