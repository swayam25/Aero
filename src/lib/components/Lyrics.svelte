<script lang="ts">
    import { store } from "$lib/player";
    import { fade } from "svelte/transition";
    import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import Button from "./ui/Button.svelte";
</script>

<div in:fade={{ duration: 200 }} class="w-full rounded-lg bg-slate-900 md:h-full">
    <div class="flex w-full items-center justify-start gap-2 p-5">
        <Button class="size-8 bg-slate-800 p-2 md:hidden" size="" onclick={() => ($store.showLyrics = false)}>
            <SolarAltArrowDownLinear class="size-full" />
        </Button>
        <h1 class="text-3xl font-bold md:text-4xl">Lyrics</h1>
    </div>

    <div class="h-[calc(100vh-232px)] overflow-y-auto px-2 pb-2 md:px-5 md:pb-5">
        {#if $store.lyrics.data}
            <p in:fade={{ duration: 100 }}>
                {$store.lyrics.data}
            </p>
        {:else}
            <div in:fade={{ duration: 100 }} class="flex size-full flex-col items-center justify-center gap-2">
                <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
                <p class="text-lg text-slate-400 md:text-xl">{$store.lyrics.error ?? "Lyrics not found"}</p>
            </div>
        {/if}
    </div>
</div>
