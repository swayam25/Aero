<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import NewPlaylistPopup from "$lib/components/NewPlaylistPopup.svelte";
    import AlertPopup from "$lib/components/ui/AlertPopup.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { openCtxMenu } from "$lib/ctxmenu";
    import type { InsertPlaylist } from "$lib/db/schema";
    import { hidePlDeletePopup, hidePlRenamePopup, store as popupStore } from "$lib/popups";
    import { supabase } from "$lib/supabase";
    import { AlertDialog, Dialog } from "bits-ui";
    import { onDestroy } from "svelte";
    import { toast } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRestartLinear from "~icons/solar/restart-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let playlists: InsertPlaylist[] = $state(data.playlists);
    $effect(() => {
        playlists = data.playlists;
    });

    // Sync playlist data with db
    const channel = supabase
        .channel("playlist-changes-playlists")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "playlist",
                filter: `user_id=eq.${data.user?.id}`
            },
            (payload) => {
                const { new: newPlaylist } = payload;
                playlists = playlists.map((playlist: InsertPlaylist) => {
                    if (playlist.id === newPlaylist.id) {
                        return { ...playlist, ...newPlaylist };
                    }
                    return playlist;
                });
            }
        )
        .subscribe();
    onDestroy(() => {
        channel.unsubscribe();
    });

    async function deletePlaylist() {
        const plID = $popupStore.playlistData?.id;
        hidePlDeletePopup();
        const resp = await fetch(`/api/playlist`, {
            body: JSON.stringify({ id: plID }),
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const respData = await resp.json();
        if (resp.ok) toast.success("Playlist deleted successfully");
        else toast.error(respData.error);
        invalidateAll();
    }

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");

    async function renamePlaylist() {
        const plID = $popupStore.playlistData?.id;
        const newName = inputValue.trim();
        hidePlRenamePopup();
        inputValue = "";
        const resp = await fetch(`/api/playlist`, {
            body: JSON.stringify({ key: "rename_pl", value: { playlistID: plID, name: newName } }),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const respData = await resp.json();
        if (resp.ok) toast.success("Playlist renamed successfully");
        else toast.error(respData.error);
        invalidateAll();
    }
</script>

<svelte:head>
    <title>Aero | Playlists</title>
</svelte:head>

<!-- Delete Alert Popup (triggered via context menu) -->
<AlertPopup title="ARE YOU SURE?" bind:open={$popupStore.showPlDeletePopup}>
    {#snippet trigger()}{/snippet}
    {#snippet description()}
        This action cannot be undone. This will permanently
        <span class="font-semibold text-red-500">delete your playlist</span> named
        <span class="font-semibold text-sky-500">{$popupStore.playlistData?.name}</span>. Please confirm that you want to proceed.
    {/snippet}
    {#snippet actions()}
        <AlertDialog.Action class="hover:!bg-red-500/10 hover:text-red-500" onclick={deletePlaylist}>
            <SolarTrashBinTrashLinear class="size-5" />
            Delete Playlist
        </AlertDialog.Action>
    {/snippet}
</AlertPopup>

<!-- Rename Popup (triggered via context menu) -->
<DialogPopup title="RENAME PLAYLIST" bind:open={$popupStore.showPlRenamePopup}>
    {#snippet trigger()}{/snippet}
    {#snippet description()}
        Enter the new name for your playlist. Be creative!
    {/snippet}
    {#snippet fields()}
        <div class="flex size-full flex-col items-start justify-center gap-2">
            <Input
                bind:value={inputValue}
                class="w-full"
                placeholder="Playlist Name"
                icon={SolarPlaylist2Linear}
                onEnter={renamePlaylist}
                max={10}
                bind:ref={input}
            />
        </div>
    {/snippet}
    {#snippet actions()}
        <Dialog.Close class="disabled:cursor-not-allowed" onclick={renamePlaylist} disabled={!inputValue}>
            <SolarRestartLinear class="size-5" />
            Rename
        </Dialog.Close>
    {/snippet}
</DialogPopup>

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
                    openCtxMenu(e, data.user?.id, null, { name: playlist.name, id: playlist.id ?? "" }, "playlist");
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
