<script lang="ts">
    import Draggable from "$lib/components/ui/Draggable.svelte";
    import { createSongActions, openCtxMenu } from "$lib/ctxmenu";
    import type { UserData } from "$lib/discord/types";
    import { play, store } from "$lib/player";
    import { setQueueAPI } from "$lib/room";
    import { userRoomStore } from "$lib/stores/userRoom";
    import { fade } from "svelte/transition";
    import HugeiconsCd from "~icons/hugeicons/cd";

    let { user }: { user: UserData | null } = $props();

    async function handleReorder(fromIndex: number, toIndex: number) {
        store.update((s) => {
            const [movedItem] = s.queue.splice(fromIndex, 1);
            s.queue.splice(toIndex, 0, movedItem);
            return { ...s };
        });
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

<div in:fade={{ duration: 200 }} class="w-full rounded-lg bg-slate-900 md:h-full">
    <div class="flex w-full items-center justify-start gap-2 p-5">
        <h1 class="text-3xl font-bold md:text-4xl">{$userRoomStore ? "Room" : ""} Queue</h1>
    </div>

    <Draggable
        onReorder={handleReorder}
        onDragEnd={async () => {
            await setQueueAPI($store.queue);
        }}
        class="h-[calc(100vh-232px)] list-none overflow-x-hidden overflow-y-auto pb-2 md:px-5 md:pb-5"
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
            handleTouchStart,
            handleTouchEnd,
            dragOverIndex,
        }: any)}
            {#each $store.queue as song, idx (song.videoId)}
                <li
                    draggable={!isRoomHost ? "false" : "true"}
                    ondragstart={(e) => handleDragStart(e, idx)}
                    ondragover={(e) => handleDragOver(e, idx)}
                    ondragenter={(e) => handleDragEnter(e, idx)}
                    ondragleave={handleDragLeave}
                    ondrop={(e) => handleDrop(e, idx)}
                    ondragend={handleDragEnd}
                    ontouchstart={(e) => handleTouchStart(e, idx)}
                    ontouchend={handleTouchEnd}
                    class="song-handle border-sky-500 transition-all duration-200"
                    class:opacity-50={isDragging && dragIndex === idx}
                    class:border-t={dragOverIndex === idx && dragIndex !== idx}
                >
                    <button
                        onclick={async () => {
                            await play(song, user?.id, true);
                        }}
                        oncontextmenu={(e) => {
                            e.preventDefault();
                            const actions = createSongActions(song, user?.id);
                            openCtxMenu(e, actions);
                        }}
                        class="group flex w-full min-w-0 cursor-pointer items-center justify-start gap-2 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-800"
                    >
                        <div class="size-10 p-1 text-lg">
                            {#if song.videoId === $store.meta?.videoId}
                                <span in:fade={{ duration: 100 }} class="size-full">
                                    <HugeiconsCd class="size-full animate-spin text-sky-500" />
                                </span>
                            {:else}
                                <span in:fade={{ duration: 100 }} class="size-full text-slate-200">{idx + 1}</span>
                            {/if}
                        </div>
                        <div
                            class="size-15 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900"
                            style="background-image: url({song.thumbnail.LARGE});"
                        ></div>
                        <div class="flex-truncate flex flex-col items-start justify-center text-left">
                            <p class="w-full truncate font-semibold" title={song.name}>{song.name}</p>
                            <p class="w-full truncate text-sm text-slate-400" title={song.artist.name}>{song.artist.name}</p>
                        </div>
                    </button>
                </li>
            {/each}
        {/snippet}
    </Draggable>
</div>
