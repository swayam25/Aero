<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import AlertPopup from "$lib/components/ui/AlertPopup.svelte";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { hidePlDeletePopup, hidePlRenamePopup, playlistsCache, store as popupStore } from "$lib/stores";
    import { AlertDialog, Dialog } from "bits-ui";
    import { toast } from "svelte-sonner";
    import SolarPlaylist2Linear from "~icons/solar/playlist-2-linear";
    import SolarRestartLinear from "~icons/solar/restart-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";

    async function deletePlaylist() {
        const plID = $popupStore.playlistData?.id;
        hidePlDeletePopup();
        popupStore.update((s) => ({ ...s, isPlDeleting: true }));
        toast.promise(
            (async () => {
                try {
                    const resp = await fetch(`/api/playlist`, {
                        body: JSON.stringify({ id: plID }),
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    const respData = await resp.json();
                    if (!resp.ok) throw new Error(respData.error || "Failed to delete playlist");
                    await playlistsCache.refresh();
                    return respData;
                } finally {
                    popupStore.update((s) => ({ ...s, isPlDeleting: false }));
                }
            })(),
            {
                loading: "Deleting playlist...",
                success: (data) => {
                    if (window.location.pathname.includes(plID!)) {
                        goto("/playlist", { invalidateAll: true });
                    }
                    return "Playlist deleted successfully";
                },
                error: (err) => String(err) || "Failed to delete playlist",
            },
        );
    }

    let inputValue: string = $state("");
    let input: HTMLInputElement | null = $state(null);

    async function renamePlaylist() {
        const plID = $popupStore.playlistData?.id;
        const newName = inputValue.trim();
        hidePlRenamePopup();
        inputValue = "";
        popupStore.update((s) => ({ ...s, isPlRenaming: true }));
        toast.promise(
            (async () => {
                try {
                    const resp = await fetch(`/api/playlist`, {
                        body: JSON.stringify({ key: "rename_pl", value: { playlistID: plID, name: newName } }),
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    const respData = await resp.json();
                    if (!resp.ok) throw new Error(respData.error || "Failed to rename playlist");
                    await playlistsCache.refresh();
                    return respData;
                } finally {
                    popupStore.update((s) => ({ ...s, isPlRenaming: false }));
                }
            })(),
            {
                loading: "Renaming playlist...",
                success: (data) => {
                    invalidateAll();
                    return "Playlist renamed successfully";
                },
                error: (err) => String(err) || "Failed to rename playlist",
            },
        );
    }
</script>

<!-- Delete Alert Popup (triggered via context menu) -->
<AlertPopup title="ARE YOU SURE?" bind:open={$popupStore.showPlDeletePopup}>
    {#snippet description()}
        This action cannot be undone. This will permanently
        <span class="font-medium text-red-500">delete your playlist</span> named
        <span class="font-medium text-sky-500">{$popupStore.playlistData?.name}</span>. Please confirm that you want to proceed.
    {/snippet}
    {#snippet actions()}
        <AlertDialog.Action class="hover:bg-red-500/10! hover:text-red-500" onclick={deletePlaylist}>
            <SolarTrashBinTrashLinear class="size-5" />
            Delete Playlist
        </AlertDialog.Action>
    {/snippet}
</AlertPopup>

<!-- Rename Popup (triggered via context menu) -->
<DialogPopup
    title="RENAME PLAYLIST"
    bind:open={$popupStore.showPlRenamePopup}
    onOpenAutoFocus={(e) => {
        e.preventDefault();
        input?.focus();
        inputValue = $popupStore.playlistData?.name || "";
    }}
>
    <!-- No trigger snippet as this is controlled by the popup -->
    {#snippet description()}
        Enter the new name for your playlist. Be creative!
    {/snippet}
    {#snippet fields()}
        <Input
            bind:value={inputValue}
            bind:ref={input}
            class="w-full"
            placeholder="Playlist Name"
            icon={SolarPlaylist2Linear}
            onEnter={renamePlaylist}
            max={20}
        />
    {/snippet}
    {#snippet actions()}
        <Dialog.Close class="disabled:cursor-not-allowed" onclick={renamePlaylist} disabled={!inputValue.trim()}>
            <SolarRestartLinear class="size-5" />
            Rename
        </Dialog.Close>
    {/snippet}
</DialogPopup>
