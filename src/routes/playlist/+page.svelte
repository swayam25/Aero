<script lang="ts">
    import NewPlaylistPopup from "$lib/components/NewPlaylistPopup.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import { createPlaylistActions, openCtxMenu } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import { supabase } from "$lib/supabase";
    import { onDestroy } from "svelte";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let playlists: InsertPlaylist[] = $derived(data.playlists);

    // Sync playlist data with db
    const channel = supabase
        .channel("playlist-changes-playlists")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "playlist",
                filter: `user_id=eq.${data.user?.id}`,
            },
            (payload) => {
                const { new: newPlaylist } = payload;
                playlists = playlists.map((playlist: InsertPlaylist) => {
                    if (playlist.id === newPlaylist.id) {
                        return { ...playlist, ...newPlaylist };
                    }
                    return playlist;
                });
            },
        )
        .subscribe();
    onDestroy(() => {
        channel.unsubscribe();
    });
</script>

<Seo title="Playlists" />

{#if playlists.length > 0}
    <div in:fade={{ duration: 100 }} class="mb-2 flex size-fit items-center justify-center gap-2 md:mb-5">
        <h1 class="text-3xl font-bold md:text-4xl">Playlists</h1>
        <NewPlaylistPopup>
            <Button class="size-fit rounded-lg p-2" size="" type="div">
                <MaterialSymbolsAdd2Rounded class="size-5" />
            </Button>
        </NewPlaylistPopup>
    </div>
{/if}

{#if playlists.length <= 0}
    <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
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
    <div in:fade={{ duration: 100 }} class="flex flex-wrap items-center justify-start gap-2">
        {#each playlists as playlist}
            <a
                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                href={`/playlist/${data.user?.id}/${playlist.id}`}
                oncontextmenu={(e) => {
                    e.preventDefault();
                    const actions = createPlaylistActions({ name: playlist.name, id: playlist.id ?? "" }, data.user?.id);
                    openCtxMenu(e, actions);
                }}
                class="group flex size-fit cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
            >
                <div
                    class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900 md:size-50"
                    style="background-image: url({playlist.cover});"
                ></div>
                <div class="text-left">
                    <p class="text-sm">{playlist.name}</p>
                </div>
            </a>
        {/each}
    </div>
{/if}
