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
</script>

{#if $store.isOpen}
    <div
        transition:fade={{ duration: 100 }}
        class="absolute z-1000 flex min-w-45 flex-col items-start justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm *:flex *:w-full *:cursor-pointer *:items-center *:justify-start *:gap-2 *:rounded-lg *:px-2 *:py-1.5 *:transition-colors *:duration-200 *:hover:bg-slate-800"
        style="top: {$store.y}px; left: {$store.x}px;"
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
