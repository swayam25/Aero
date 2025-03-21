<script lang="ts">
    import { store } from "$lib/ctxmenu";
    import { addToQueue, play, store as playerStore, removeFromQueue } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarNotificationLinesRemoveLinear from "~icons/solar/notification-lines-remove-linear";
    import SolarPlayLinear from "~icons/solar/play-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";

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
</script>

{#if $store.isOpen}
    <div
        transition:fade={{ duration: 100 }}
        bind:this={ctxMenu}
        class="absolute z-1000 flex min-w-45 flex-col items-start justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm *:flex *:w-full *:cursor-pointer *:items-center *:justify-start *:gap-2 *:rounded-lg *:px-2 *:py-1.5 *:transition-colors *:duration-200 *:hover:bg-slate-800"
        style="top: {y}px; left: {x}px;"
    >
        {#if $store.type === "song" && $store.song && $playerStore.queue.length > 0}
            <!-- Play -->
            <button
                onclick={async () => {
                    if ($store.song) await play($store.song);
                }}
            >
                <SolarPlayLinear class="size-5" />
                Play
            </button>
            <!-- Add To Queue -->
            <button
                onclick={async () => {
                    if ($store.song) await addToQueue($store.song);
                }}
            >
                <SolarPlaylist2Linear class="size-5" />
                Add to Queue
            </button>
        {:else if $store.type === "queue" && $store.song && $store.song.videoId !== $playerStore.meta?.videoId}
            <!-- Play -->
            <button
                onclick={async () => {
                    if ($store.song) await play($store.song, true);
                }}
            >
                <SolarPlayLinear class="size-5" />
                Play
            </button>
            <!-- Remove From Queue -->
            <button
                onclick={async () => {
                    if ($store.song) await removeFromQueue($store.song);
                }}
            >
                <SolarNotificationLinesRemoveLinear class="size-5" />
                Remove from Queue
            </button>
        {/if}
    </div>
{/if}
