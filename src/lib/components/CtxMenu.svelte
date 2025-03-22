<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { store } from "$lib/ctxmenu";
    import { addToQueue, play, store as playerStore, removeFromQueue } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarNotificationLinesRemoveLinear from "~icons/solar/notification-lines-remove-linear";
    import SolarPlayLinear from "~icons/solar/play-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import CtxButton from "./CtxButton.svelte";

    $effect(() => {
        const bodyElement = document.getElementById("body");
        const queueElement = document.getElementById("queue");
        if (bodyElement && queueElement) {
            bodyElement.style.overflow = $store.isOpen ? "hidden" : "";
            queueElement.style.overflow = $store.isOpen ? "hidden" : "";
        }
    });

    let ctxMenu: HTMLDivElement | null = $state(null);
    let x: number = $state(0);
    let y: number = $state(0);

    $effect(() => {
        if ($store.isOpen && ctxMenu) {
            const { offsetHeight: menuHeight, offsetWidth: menuWidth } = ctxMenu;
            const playerRect = document.getElementById("player")?.getBoundingClientRect();

            // Adjust vertical position
            if ($store.y + menuHeight > window.innerHeight) {
                y = Math.max($store.y - menuHeight, 50);
            } else if (playerRect && $store.y + menuHeight > playerRect.top) {
                y = Math.max($store.y - menuHeight, 50);
            } else {
                y = $store.y;
            }

            // Adjust horizontal position
            if ($store.x + menuWidth > window.innerWidth) {
                x = Math.max($store.x - menuWidth, 50);
            } else if (playerRect && $store.x + menuWidth > playerRect.left) {
                x = Math.max($store.x - menuWidth, 50);
            } else {
                x = $store.x;
            }
        }
    });

    export async function deletePlaylist() {
        const resp = await fetch(`/api/playlist`, {
            body: JSON.stringify({ id: $store.playlistData?.id }),
            method: "DELETE"
        });
        invalidateAll();
    }
</script>

{#if $store.isOpen}
    <div
        transition:fade={{ duration: 100 }}
        bind:this={ctxMenu}
        class="absolute z-1000 flex min-w-45 flex-col items-start justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"
        style="top: {y}px; left: {x}px;"
    >
        {#if $store.type === "song" && $store.song}
            <!-- Play -->
            <CtxButton
                onclick={async () => {
                    if ($store.song) await play($store.song);
                }}
            >
                <SolarPlayLinear class="size-5" />
                Play
            </CtxButton>
            {#if $playerStore.queue.length > 0}
                <!-- Add To Queue -->
                <CtxButton
                    onclick={async () => {
                        if ($store.song) await addToQueue($store.song);
                    }}
                >
                    <SolarPlaylist2Linear class="size-5" />
                    Add to Queue
                </CtxButton>
            {/if}
        {:else if $store.type === "queue" && $store.song && $store.song.videoId !== $playerStore.meta?.videoId}
            <!-- Play -->
            <CtxButton
                onclick={async () => {
                    if ($store.song) await play($store.song, true);
                }}
            >
                <SolarPlayLinear class="size-5" />
                Play
            </CtxButton>
            <!-- Remove From Queue -->
            <CtxButton
                onclick={async () => {
                    if ($store.song) await removeFromQueue($store.song);
                }}
            >
                <SolarNotificationLinesRemoveLinear class="size-5" />
                Remove from Queue
            </CtxButton>
        {:else if $store.type === "playlist" && $store.playlistData}
            <!-- Play -->
            <CtxButton>
                <SolarPlayLinear class="size-5" />
                Play
            </CtxButton>
            <!-- Delete Playlist -->
            <CtxButton type="error" onclick={deletePlaylist}>
                <SolarTrashBinTrashLinear class="size-5" />
                Delete Playlist
            </CtxButton>
        {/if}
    </div>
{/if}
