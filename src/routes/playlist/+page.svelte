<script lang="ts">
    import ImportPlaylist from "$lib/components/ImportPlaylist.svelte";
    import NewPlaylistPopup from "$lib/components/NewPlaylistPopup.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { createPlaylistActions, openCtxMenu } from "$lib/ctxmenu";
    import { isCreatingPlaylist, isImportingPlaylist, playlistsCache } from "$lib/stores";
    import { formatCount } from "$lib/utils/format";
    import { animate, stagger } from "animejs";
    import { onMount, tick } from "svelte";
    import { fade } from "svelte/transition";
    import IconParkOutlineLoadingFour from "~icons/icon-park-outline/loading-four";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarImportLinear from "~icons/solar/import-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let playlistsContainer: HTMLDivElement | undefined = $state();
    let hasAnimated = $state(false);

    onMount(async () => {
        if (playlistsCache.isStale($playlistsCache)) {
            await playlistsCache.refresh();
        }
    });

    $effect(() => {
        if (playlistsContainer && !hasAnimated && $playlistsCache.playlists.length > 0) {
            tick().then(() => {
                const playlistCards = playlistsContainer?.querySelectorAll(".playlist-card");

                if (playlistCards && playlistCards.length > 0) {
                    hasAnimated = true;

                    playlistCards.forEach((card) => {
                        (card as HTMLElement).style.opacity = "0";
                    });

                    animate(playlistCards, {
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        translateY: [20, 0],
                        easing: "out(3)",
                        duration: 200,
                        delay: stagger(80, { start: 100 }),
                    });
                }
            });
        }
    });
</script>

<Seo title="Playlists" />

{#if $playlistsCache.playlists.length > 0}
    <div in:fade={{ duration: 100 }} class="mb-2 flex size-fit items-center justify-center gap-2 md:mb-5">
        <h1 class="text-3xl font-bold md:text-4xl">Playlists</h1>
        <NewPlaylistPopup>
            <Tooltip side="bottom" content="New playlist">
                <Button size="icon" type="div" disabled={$isCreatingPlaylist}>
                    {#if $isCreatingPlaylist}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <MaterialSymbolsAdd2Rounded class="size-5" />
                        </span>
                    {/if}
                </Button>
            </Tooltip>
        </NewPlaylistPopup>
        <ImportPlaylist>
            <Tooltip side="bottom" content="Import playlist">
                <Button size="icon" type="div" disabled={$isImportingPlaylist}>
                    {#if $isImportingPlaylist}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <SolarImportLinear class="size-5" />
                        </span>
                    {/if}
                </Button>
            </Tooltip>
        </ImportPlaylist>
    </div>
{/if}

{#if $playlistsCache.playlists.length <= 0}
    <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
        <div class="flex flex-col items-center justify-center gap-2">
            <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
            <p class="text-lg text-slate-400 md:text-xl">No playlists found</p>
            <NewPlaylistPopup>
                <Button disabled={$isCreatingPlaylist}>
                    {#if $isCreatingPlaylist}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <MaterialSymbolsAdd2Rounded class="size-5" />
                        </span>
                    {/if}
                    <span>Create New</span>
                </Button>
            </NewPlaylistPopup>
            <ImportPlaylist>
                <Button disabled={$isImportingPlaylist}>
                    {#if $isImportingPlaylist}
                        <span in:fade={{ duration: 100 }}>
                            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <SolarImportLinear class="size-5" />
                        </span>
                    {/if}
                    <span>Import</span>
                </Button>
            </ImportPlaylist>
        </div>
    </div>
{:else}
    <div bind:this={playlistsContainer} in:fade={{ duration: 100 }} class="flex flex-wrap items-center justify-start gap-2">
        {#each $playlistsCache.playlists as playlist}
            <a
                href={`/playlist/${data.user?.id}/${playlist.id}`}
                oncontextmenu={(e) => {
                    e.preventDefault();
                    const actions = createPlaylistActions({ name: playlist.name, id: playlist.id ?? "" }, data.user?.id);
                    openCtxMenu(e, actions);
                }}
                class="playlist-card group flex size-fit cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
            >
                <div
                    class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900 md:size-50"
                    style="background-image: url({playlist.cover});"
                ></div>
                <div class="flex w-40 items-center justify-between gap-2 text-sm md:w-50">
                    <p class="min-w-0 flex-1 truncate" title={playlist.name}>{playlist.name}</p>
                    {#if playlist.songs.length >= 1}
                        <p class="shrink-0 text-slate-400">{formatCount(playlist.songs.length)} songs</p>
                    {/if}
                </div>
            </a>
        {/each}
    </div>
{/if}
