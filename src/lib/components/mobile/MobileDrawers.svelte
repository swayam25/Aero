<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { store } from "$lib/player";
    import { setQueueAPI } from "$lib/room";
    import { userRoomStore } from "$lib/stores/userRoom";
    import { createTouchDeviceQuery } from "$lib/utils/mobile";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import IconParkOutlineCheck from "~icons/icon-park-outline/check";
    import IconParkOutlineLoadingFour from "~icons/icon-park-outline/loading-four";
    import SolarSortLinear from "~icons/solar/sort-linear";
    import Button from "../ui/Button.svelte";
    import MobileDrawer from "../ui/MobileDrawer.svelte";
    import MobileLyrics from "./MobileLyrics.svelte";
    import MobilePlayer from "./MobilePlayer.svelte";
    import MobileQueue from "./MobileQueue.svelte";

    let { user, showMobilePlayer = $bindable(false) }: { user: UserData | null; showMobilePlayer: boolean } = $props();

    let isRearrangeMode = $state(false);
    let isSyncing = $state(false);

    async function toggleRearrangeMode() {
        if (isRearrangeMode) {
            isSyncing = true;
            handleRearrangeExit(); // No await here to allow UI to update
        }

        isRearrangeMode = !isRearrangeMode;
        if (isRearrangeMode && "vibrate" in navigator) {
            navigator.vibrate([30, 10, 20]);
        }
    }

    async function handleRearrangeExit() {
        await setQueueAPI($store.queue);
        isSyncing = false;
    }

    let isRoomHost: boolean = $derived.by(() => {
        if ($userRoomStore && user) {
            return $userRoomStore.hostUserId === user.id;
        } else {
            return true;
        }
    });

    function closeMobilePlayer() {
        showMobilePlayer = false;
    }

    // Handle queue/lyrics state
    function closeQueue() {
        $store.showQueue = false;
    }

    function closeLyrics() {
        $store.showLyrics = false;
    }

    let hasTouchPoint = $state(false);
    onMount(() => {
        const cleanup = createTouchDeviceQuery((touch) => {
            hasTouchPoint = touch;
        });
        return cleanup;
    });

    let seekStarted = $state(false);
</script>

<!-- Mobile Player Drawer (Full Screen) -->
<MobileDrawer
    title="Now Playing"
    open={showMobilePlayer}
    onClose={closeMobilePlayer}
    fullScreen={true}
    backgroundImage={$store.meta?.thumbnails?.[0]?.url || ""}
    blur={true}
    dismissible={!seekStarted}
>
    <MobilePlayer {user} bind:show={showMobilePlayer} bind:seekStarted />
</MobileDrawer>

<!-- Queue Drawer -->
<MobileDrawer open={$store.showQueue} dismissible={!isRearrangeMode} onClose={closeQueue} maxHeight="max-h-[80vh]" zIndex={801}>
    {#snippet header()}
        <div class="flex w-full items-center justify-between px-4" class:justify-center!={!(isRoomHost && hasTouchPoint)}>
            <h2 class="text-xl font-medium text-slate-200">{$userRoomStore ? "Room" : ""} Queue</h2>
            {#if isRoomHost && hasTouchPoint}
                <Button
                    size="icon"
                    onclick={toggleRearrangeMode}
                    class={isRearrangeMode && !isSyncing ? "bg-green-500/10! text-green-500!" : ""}
                    disabled={isSyncing}
                >
                    {#if isSyncing}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        </span>
                    {:else if isRearrangeMode}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineCheck class="size-5" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <SolarSortLinear class="size-5" />
                        </span>
                    {/if}
                </Button>
            {/if}
        </div>
    {/snippet}
    <MobileQueue {user} bind:isRearrangeMode onRearrangeModeExit={handleRearrangeExit} />
</MobileDrawer>

<!-- Lyrics Drawer -->
<MobileDrawer open={$store.showLyrics} onClose={closeLyrics} title="Lyrics" maxHeight="max-h-[80vh]" zIndex={802}>
    <MobileLyrics />
</MobileDrawer>
