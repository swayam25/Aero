<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import NewPlaylistPopup from "$lib/components/NewPlaylistPopup.svelte";
    import AlertPopup from "$lib/components/ui/AlertPopup.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { store as ctxStore, openCtxMenu } from "$lib/ctxmenu";
    import { hidePlDeletePopup, hidePlRenamePopup, store as popupStore } from "$lib/popups";
    import { AlertDialog, Dialog } from "bits-ui";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRestartLinear from "~icons/solar/restart-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    async function deletePlaylist() {
        const plID = $ctxStore.playlistData?.id;
        hidePlDeletePopup();
        const resp = await fetch(`/api/playlist`, {
            body: JSON.stringify({ id: plID }),
            method: "DELETE"
        });
        invalidateAll();
    }

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");

    function renamePlaylist() {
        console.log($ctxStore);
        const plID = $ctxStore.playlistData?.id;
        const newName = inputValue.trim();
        console.log(plID, newName);
        hidePlRenamePopup();
        inputValue = "";
        const resp = fetch(`/api/playlist`, {
            body: JSON.stringify({ key: "rename_pl", value: { id: plID, name: newName } }),
            method: "POST"
        });
        invalidateAll();
    }
</script>

<!-- Delete Alert Popup (triggered via context menu) -->
<AlertPopup title="ARE YOU SURE?" bind:open={$popupStore.showPlDeletePopup}>
    {#snippet trigger()}{/snippet}
    {#snippet description()}
        This action cannot be undone. This will permanently
        <span class="font-semibold text-red-500">delete your playlist</span> named
        <span class="font-semibold text-sky-500">{$ctxStore.playlistData?.name}</span>. Please confirm that you want to proceed.
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
        {#each data.playlists as playlist}
            <a
                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                href={`/playlist/${data.user.id}/${playlist.id}`}
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
