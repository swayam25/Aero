<script lang="ts">
    import { createQueueActions, openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { previous, seekTo, setVolume, skip, store, togglePause } from "$lib/player";
    import { formatTime } from "$lib/utils/time";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fly } from "svelte/transition";
    import SolarPauseCircleBold from "~icons/solar/pause-circle-bold";
    import SolarPlayCircleBold from "~icons/solar/play-circle-bold";
    import SolarSkipNextBold from "~icons/solar/skip-next-bold";
    import SolarSkipPreviousBold from "~icons/solar/skip-previous-bold";
    import PlayerButtons from "./PlayerButtons.svelte";
    import MarqueeText from "./ui/MarqueeText.svelte";
    import Slider from "./ui/Slider.svelte";

    let {
        user,
        onSongInfoClick = () => {},
    }: {
        user: UserData | null;
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

    let downloadLoading: boolean = $state(false);
    async function handleDownload() {
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
    <PlayerButtons {user} iconSize="size-5" gap="gap-4" py="" class="absolute right-5 hidden sm:flex" />

    <!-- Player Video Element (hidden) -->
    <div id="player-iframe" class="hidden opacity-0"></div>
</div>
