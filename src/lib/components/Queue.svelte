<script lang="ts">
    import Draggable from "$lib/components/ui/Draggable.svelte";
    import { createSongActions, openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { play, store } from "$lib/player";
    import { setQueueAPI } from "$lib/room";
    import { userRoomStore } from "$lib/stores/userRoom";
    import { createMobileMediaQuery } from "$lib/utils/mobile";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import HugeiconsCd from "~icons/hugeicons/cd";
    import IconParkOutlineDrag from "~icons/icon-park-outline/drag";
    import Thumbnail from "./Thumbnail.svelte";

    let {
        user,
        isRearrangeMode = $bindable(false),
        onRearrangeModeExit,
    }: { user: UserData | null; isRearrangeMode?: boolean; onRearrangeModeExit?: () => void } = $props();
    let touchStartY = $state(0);
    let touchStartX = $state(0);
    let touchCurrentY = $state(0);
    let draggedIndex = $state<number | null>(null);
    let dragOverIdx = $state<number | null>(null);
    let isDraggingStarted = $state(false);

    async function handleReorder(fromIndex: number, toIndex: number) {
        store.update((s) => {
            const [movedItem] = s.queue.splice(fromIndex, 1);
            // Adjust toIndex if moving down (fromIndex < toIndex)
            const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
            s.queue.splice(adjustedIndex, 0, movedItem);
            return { ...s };
        });
    }

    function handleTouchStart(e: TouchEvent, idx: number) {
        if (!isRearrangeMode) return;
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        draggedIndex = idx;
        isDraggingStarted = false;
    }

    function handleTouchMove(e: TouchEvent, container: HTMLElement) {
        if (!isRearrangeMode || draggedIndex === null) return;

        const touch = e.touches[0];
        const deltaY = Math.abs(touch.clientY - touchStartY);
        const deltaX = Math.abs(touch.clientX - touchStartX);

        // Start dragging if moved more than 10px vertically or horizontally or if already dragging
        if (!isDraggingStarted) {
            if (deltaY > 10 || deltaX > 10) {
                isDraggingStarted = true;
                if ("vibrate" in navigator) {
                    navigator.vibrate([10, 5, 10]);
                }
            } else {
                return;
            }
        }

        e.preventDefault();
        touchCurrentY = touch.clientY;

        const items = Array.from(container.querySelectorAll(".song-handle"));
        let overIndex = -1;

        for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect();
            if (touchCurrentY >= rect.top && touchCurrentY <= rect.bottom) {
                overIndex = i;
                break;
            }
        }

        if (overIndex !== -1) {
            dragOverIdx = overIndex;
        }
    }

    function handleTouchEnd() {
        if (!isRearrangeMode || draggedIndex === null) return;

        if (isDraggingStarted && dragOverIdx !== null && draggedIndex !== dragOverIdx) {
            handleReorder(draggedIndex, dragOverIdx);
            // Don't sync immediately on mobile - wait for user to exit rearrange mode
        }

        draggedIndex = null;
        dragOverIdx = null;
        isDraggingStarted = false;
    }

    // Room
    let isRoomHost: boolean = $derived.by(() => {
        if ($userRoomStore && user) {
            return $userRoomStore.hostUserId === user.id;
        } else {
            return true;
        }
    });

    let isMobile = $state(false);
    onMount(() => {
        const cleanup = createMobileMediaQuery((mobile) => {
            isMobile = mobile;
        });
        return cleanup;
    });
</script>

<div in:fade={{ duration: 200 }} class="w-full rounded-lg bg-slate-900 md:h-full">
    <div class="flex w-full items-center justify-start gap-2 p-5">
        <h1 class="text-3xl font-bold md:text-4xl">{$userRoomStore ? "Room" : ""} Queue</h1>
    </div>

    <div
        role="list"
        class="h-[calc(100vh-232px)] list-none pb-2 md:px-5 md:pb-5"
        class:overflow-hidden={isRearrangeMode}
        class:overflow-y-auto={!isRearrangeMode}
        class:overflow-x-hidden={!isRearrangeMode}
        ontouchmove={(e) => isMobile && isRearrangeMode && handleTouchMove(e, e.currentTarget)}
        ontouchend={handleTouchEnd}
    >
        <Draggable
            onReorder={handleReorder}
            onDragEnd={async () => {
                await setQueueAPI($store.queue);
            }}
            disabled={!isRoomHost}
        >
            {#snippet children({
                isDragging,
                dragIndex,
                handleDragStart,
                handleDragOver,
                handleDragEnter,
                handleDragLeave,
                handleDrop,
                handleDragEnd,
                dragOverIndex,
            }: any)}
                {#each $store.queue as song, idx (song.videoId)}
                    <!-- Drop indicator before item -->
                    <div
                        class="h-2 w-full rounded-lg transition-all duration-200"
                        class:bg-sky-500={(dragOverIndex === idx && dragIndex !== idx) || (dragOverIdx === idx && draggedIndex !== idx)}
                    ></div>
                    <li
                        draggable={!isRoomHost || isRearrangeMode ? "false" : "true"}
                        ondragstart={(e) => handleDragStart(e, idx)}
                        ondragover={(e) => handleDragOver(e, idx)}
                        ondragenter={(e) => handleDragEnter(e, idx)}
                        ondragleave={handleDragLeave}
                        ondrop={(e) => handleDrop(e, idx)}
                        ondragend={handleDragEnd}
                        class="song-handle transition-all duration-200"
                        class:opacity-80={isDragging && dragIndex === idx}
                        class:wiggle={isRearrangeMode && isMobile}
                    >
                        <button
                            onclick={async () => {
                                if (!isRearrangeMode) {
                                    await play(song, user?.id, true);
                                }
                            }}
                            oncontextmenu={(e) => {
                                if (!isRearrangeMode) {
                                    e.preventDefault();
                                    const actions = createSongActions(song, user?.id);
                                    openCtxMenu(e, actions);
                                }
                            }}
                            class="group flex w-full min-w-0 items-center justify-start gap-2 rounded-lg p-2 transition-colors duration-200"
                            class:cursor-pointer={!isRearrangeMode}
                            class:hover:bg-slate-800={!isRearrangeMode}
                            class:cursor-default={isRearrangeMode}
                        >
                            <div class="size-10 p-1 text-lg">
                                {#if isRearrangeMode && isMobile}
                                    <div
                                        role="button"
                                        tabindex="0"
                                        ontouchstart={(e) => handleTouchStart(e, idx)}
                                        class="flex size-full touch-none items-center justify-center text-slate-400"
                                        style="touch-action: none;"
                                    >
                                        <IconParkOutlineDrag class="size-6" />
                                    </div>
                                {:else if song.videoId === $store.meta?.videoId}
                                    <span in:fade={{ duration: 100 }} class="size-full">
                                        <HugeiconsCd class="size-full animate-spin text-sky-500" />
                                    </span>
                                {:else}
                                    <span in:fade={{ duration: 100 }} class="size-full text-slate-200">{idx + 1}</span>
                                {/if}
                            </div>
                            <Thumbnail
                                src={song.thumbnails?.[0]?.url}
                                alt={song.name}
                                class="size-15 shrink-0 rounded-lg transition-colors duration-200 group-hover:bg-slate-900"
                            />
                            <div class="flex-truncate flex flex-col items-start justify-center text-left">
                                <p class="w-full truncate font-medium" title={song.name}>{song.name}</p>
                                <p class="w-full truncate text-sm text-slate-400" title={song.artist.name}>{song.artist.name}</p>
                            </div>
                        </button>
                    </li>
                {/each}
                <!-- Drop indicator after last item -->
                <div
                    class="h-2 w-full rounded-lg transition-all duration-200"
                    class:bg-sky-500={(dragOverIndex === $store.queue.length && dragIndex !== null) ||
                        (dragOverIdx === $store.queue.length && draggedIndex !== null)}
                ></div>
            {/snippet}
        </Draggable>
    </div>
</div>
