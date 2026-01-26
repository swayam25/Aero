<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import AlertPopup from "$lib/components/ui/AlertPopup.svelte";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { deleteRoomAPI, renameRoomAPI } from "$lib/room";
    import { hideRoomDeletePopup, hideRoomRenamePopup, store as popupStore } from "$lib/stores";
    import { AlertDialog, Dialog } from "bits-ui";
    import { toast } from "svelte-sonner";
    import SolarRestartLinear from "~icons/solar/restart-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import SolarUsersGroupRoundedLinear from "~icons/solar/users-group-rounded-linear";

    let inputValue: string = $state("");
    let input: HTMLInputElement | null = $state(null);

    // Room actions
    async function deleteRoom() {
        const roomID = $popupStore.roomData?.id;
        if (!roomID) return;
        hideRoomDeletePopup();
        popupStore.update((s) => ({ ...s, isRoomDeleting: true }));
        toast.promise(
            (async () => {
                try {
                    const resp = await deleteRoomAPI(roomID);
                    if ("error" in resp) throw new Error(resp.error || "Failed to delete room");
                    return resp;
                } finally {
                    popupStore.update((s) => ({ ...s, isRoomDeleting: false }));
                }
            })(),
            {
                loading: "Deleting room...",
                success: (data) => {
                    return "Room deleted successfully";
                },
                error: (err) => String(err) || "Failed to delete room",
            },
        );
    }

    async function renameRoom() {
        const roomID = $popupStore.roomData?.id;
        if (!roomID) return;
        const newName = inputValue.trim();
        hideRoomRenamePopup();
        inputValue = "";
        popupStore.update((s) => ({ ...s, isRoomRenaming: true }));
        toast.promise(
            (async () => {
                try {
                    const resp = await renameRoomAPI(roomID, newName);
                    if ("error" in resp) throw new Error(resp.error || "Failed to rename room");
                    return resp;
                } finally {
                    popupStore.update((s) => ({ ...s, isRoomRenaming: false }));
                }
            })(),
            {
                loading: "Renaming room...",
                success: (data) => {
                    invalidateAll();
                    return "Room renamed successfully";
                },
                error: (err) => String(err) || "Failed to rename room",
            },
        );
    }
</script>

<!-- Room Delete Alert Popup -->
<AlertPopup title="ARE YOU SURE?" bind:open={$popupStore.showRoomDeletePopup}>
    {#snippet description()}
        This action cannot be undone. This will permanently
        <span class="font-medium text-red-500">delete your room</span> named
        <span class="font-medium text-sky-500">{$popupStore.roomData?.name}</span>. Please confirm that you want to proceed.
    {/snippet}
    {#snippet actions()}
        <AlertDialog.Action class="hover:bg-red-500/10! hover:text-red-500" onclick={deleteRoom}>
            <SolarTrashBinTrashLinear class="size-5" />
            Delete Room
        </AlertDialog.Action>
    {/snippet}
</AlertPopup>

<!-- Room Rename Popup -->
<DialogPopup
    title="RENAME ROOM"
    bind:open={$popupStore.showRoomRenamePopup}
    onOpenAutoFocus={(e) => {
        e.preventDefault();
        input?.focus();
        inputValue = $popupStore.roomData?.name || "";
    }}
>
    {#snippet description()}
        Enter the new name for your room.
    {/snippet}
    {#snippet fields()}
        <Input
            bind:value={inputValue}
            bind:ref={input}
            class="w-full"
            placeholder="Room Name"
            icon={SolarUsersGroupRoundedLinear}
            onEnter={renameRoom}
            max={20}
        />
    {/snippet}
    {#snippet actions()}
        <Dialog.Close class="disabled:cursor-not-allowed" onclick={renameRoom} disabled={!inputValue.trim()}>
            <SolarRestartLinear class="size-5" />
            Rename
        </Dialog.Close>
    {/snippet}
</DialogPopup>
