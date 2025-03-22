<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import NewPlaylistPopup from "$lib/components/NewPlaylistPopup.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

{#if data.playlists.length > 0}
    <div in:fade={{ duration: 100 }} class="mb-2 flex size-fit items-center justify-center gap-2 md:mb-5">
        <h1 class="text-3xl font-bold md:text-4xl">Playlists</h1>
        <NewPlaylistPopup>
            <Button class="size-fit rounded-lg p-2" size="">
                <MaterialSymbolsAdd2Rounded class="size-5" />
            </Button>
        </NewPlaylistPopup>
    </div>
{/if}

{#if data.playlists.length <= 0}
    <div class="flex size-full items-center justify-center">
        <div class="flex flex-col items-center justify-center gap-2">
            <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
            <p class="text-lg text-slate-400 md:text-xl">No playlists found</p>
            <NewPlaylistPopup>
                <Button>
                    <MaterialSymbolsAdd2Rounded class="size-5" />
                    <span>Create New</span>
                </Button>
            </NewPlaylistPopup>
        </div>
    </div>
{:else}
    <div class="flex flex-wrap items-center justify-start gap-2">
        {#each data.playlists as playlist, i}
            <a
                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                href={`/playlist/${playlist.id}`}
                oncontextmenu={(e) => {
                    e.preventDefault();
                    openCtxMenu(e, null, { name: playlist.name, id: playlist.id }, "playlist");
                }}
                class="group flex size-fit cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
            >
                <div class="size-40 rounded-lg bg-slate-800 transition-colors duration-200 group-hover:bg-slate-900 md:size-50"></div>
                <div class="text-left">
                    <p class="text-sm">{playlist.name.length > 20 ? playlist.name.slice(0, 20) + "..." : playlist.name}</p>
                </div>
            </a>
        {/each}
    </div>
{/if}
