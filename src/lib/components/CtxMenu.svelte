<script lang="ts">
    import { store } from "$lib/ctxmenu";
    import { addToQueue, play } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarPlayLinear from "~icons/solar/play-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";

    $effect(() => {
        const bodyElement = document.getElementById("body");
        if (bodyElement) {
            bodyElement.style.overflow = $store.isOpen ? "hidden" : "";
        }
    });

    let ctxMenu: HTMLDivElement | null = $state(null);
    let x: number = $state(0);
    let y: number = $state(0);

    $effect(() => {
        if ($store.isOpen) {
            if (ctxMenu) {
                const menuHeight = ctxMenu.offsetHeight;
                const menuWidth = ctxMenu.offsetWidth;

                const playerElement = document.getElementById("player");
                const playerRect = playerElement?.getBoundingClientRect();

                // Adjust vertical position
                if (window.innerHeight - $store.y < menuHeight || (playerRect && $store.y + menuHeight > playerRect.top)) {
                    y = Math.abs($store.y - menuHeight);
                } else {
                    y = $store.y;
                }

                // Adjust horizontal position
                if (window.innerWidth - $store.x < menuWidth || (playerRect && $store.x + menuWidth > playerRect.left)) {
                    x = Math.abs($store.x - menuWidth);
                } else {
                    x = $store.x;
                }
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
        {#if $store.type === "song" && $store.song}
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
        {/if}
    </div>
{/if}
