<script lang="ts">
    import { goto } from "$app/navigation";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { joinRoomAPI } from "$lib/room";
    import { hideJoinRoomPopup, isCreatingRoom, isJoiningRoom, store } from "$lib/stores";
    import { toast } from "svelte-sonner";
    import SolarLoginLinear from "~icons/solar/login-linear";

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state($store.roomData?.id || "");
    let passwordValue: string = $state("");

    async function joinRoom() {
        const roomID = inputValue.trim();
        const roomPass = passwordValue || "";
        if (!roomID) return;

        toast.promise(
            (async () => {
                $isJoiningRoom = true;
                try {
                    const resp = await joinRoomAPI(roomID, roomPass);
                    if ("error" in resp) throw new Error(resp.error || "Failed to join room");
                    return resp;
                } finally {
                    $isJoiningRoom = false;
                }
            })(),
            {
                loading: "Joining room...",
                success: (data) => {
                    hideJoinRoomPopup();
                    goto(`/room/${roomID}`, { invalidateAll: true });
                    return "Joined room successfully";
                },
                error: (err) => String(err) || "Failed to join room",
            },
        );
    }
</script>

<DialogPopup
    title="JOIN ROOM"
    bind:open={$store.showJoinRoomPopup}
    onOpenAutoFocus={(e) => {
        e.preventDefault();
        input?.focus();
    }}
    disabled={$isJoiningRoom || $isCreatingRoom}
>
    {#snippet trigger()}{/snippet}
    {#snippet description()}
        {#if $store.roomData?.id}
            Enter the Room ID and Password (if required) to join the room.
        {:else}
            This room is password protected. Please enter the Room Password to join.
        {/if}
    {/snippet}
    {#snippet fields()}
        <div class="space-y-2">
            <div class="flex flex-col gap-1" class:hidden={$store.roomData?.id}>
                <label for="roomID" class="text-sm text-slate-200">Room ID</label>
                <Input id="roomID" bind:value={inputValue} class="w-full" placeholder="Enter room id" onEnter={joinRoom} bind:ref={input} />
            </div>
            <div class="flex flex-col gap-1">
                <label for="roomPassword" class="text-sm text-slate-200">Password (if required)</label>
                <Input id="roomPassword" bind:value={passwordValue} class="w-full" placeholder={"•".repeat(16)} type="password" onEnter={joinRoom} />
            </div>
        </div>
    {/snippet}
    {#snippet actions()}
        <button
            class="not-disabled:hover:bg-green-500/10! not-disabled:hover:text-green-500 disabled:cursor-not-allowed"
            onclick={joinRoom}
            disabled={!inputValue || $isJoiningRoom}
            class:!cursor-progress={$isJoiningRoom}
        >
            <SolarLoginLinear class="size-5" />
            Join
        </button>
    {/snippet}
</DialogPopup>
