<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import AlertPopup from "$lib/components/ui/AlertPopup.svelte";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
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
        hideRoomDeletePopup();
        toast.promise(
            (async () => {
                const resp = await fetch(`/api/room`, {
                    body: JSON.stringify({ id: roomID }),
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const respData = await resp.json();
                if (!resp.ok) throw new Error(respData.error || "Failed to delete room");
                return respData;
            })(),
            {
                loading: "Deleting room...",
                success: (data) => {
                    if (window.location.pathname.includes(roomID!)) {
                        goto("/room", { invalidateAll: true });
                    }
                    return "Room deleted successfully";
                },
                error: (err) => String(err) || "Failed to delete room",
            },
        );
    }

    async function renameRoom() {
        const roomID = $popupStore.roomData?.id;
        const newName = inputValue.trim();
        hideRoomRenamePopup();
        inputValue = "";
        toast.promise(
            (async () => {
                const resp = await fetch(`/api/room`, {
                    body: JSON.stringify({ key: "rename_room", value: { roomID: roomID, name: newName } }),
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const respData = await resp.json();
                if (!resp.ok) throw new Error(respData.error || "Failed to rename room");
                return respData;
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
        <span class="font-semibold text-red-500">delete your room</span> named
        <span class="font-semibold text-sky-500">{$popupStore.roomData?.name}</span>. Please confirm that you want to proceed.
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
        <Dialog.Close class="disabled:cursor-not-allowed" onclick={renameRoom} disabled={!inputValue}>
            <SolarRestartLinear class="size-5" />
            Rename
        </Dialog.Close>
    {/snippet}
</DialogPopup>
