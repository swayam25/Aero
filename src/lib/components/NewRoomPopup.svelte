<script lang="ts">
    import { goto, invalidateAll } from "$app/navigation";
    import DialogPopup from "$lib/components/ui/DialogPopup.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import { createRoomAPI } from "$lib/room";
    import { isCreatingRoom, isJoiningRoom } from "$lib/stores";
    import { type Snippet } from "svelte";
    import { toast } from "svelte-sonner";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import Switch from "./ui/Switch.svelte";
    import Tooltip from "./ui/Tooltip.svelte";

    interface Props {
        children: Snippet;
    }
    let { children }: Props = $props();

    let input: HTMLInputElement | null = $state(null);
    let inputValue: string = $state("");
    let passwordValue: string = $state("");
    let isPublic: boolean = $state(true);
    let open: boolean = $state(false);

    async function createRoom() {
        if ($isCreatingRoom) return;

        const roomName = inputValue.trim();
        const roomPass = passwordValue;
        if (!roomName) return;

        toast.promise(
            (async () => {
                $isCreatingRoom = true;
                try {
                    const resp = await createRoomAPI(roomName, roomPass, isPublic);
                    if ("error" in resp) throw new Error(resp.error || "Failed to create room");
                    await invalidateAll();
                    return resp;
                } finally {
                    $isCreatingRoom = false;
                }
            })(),
            {
                loading: "Creating room...",
                success: (data) => {
                    inputValue = "";
                    passwordValue = "";
                    open = false;
                    goto(`/room/${data.room.id}`, { invalidateAll: true });
                    return "Room created successfully";
                },
                error: (err) => String(err) || "Failed to create room",
            },
        );
    }
</script>

<DialogPopup
    title="NEW ROOM"
    bind:open
    onOpenAutoFocus={(e) => {
        e.preventDefault();
        input?.focus();
    }}
    disabled={$isCreatingRoom || $isJoiningRoom}
>
    {#snippet trigger()}
        {@render children()}
    {/snippet}
    {#snippet description()}
        Enter a new name for the room and optionally a password. Click <span class="font-semibold text-sky-500">create</span> to create a new room.
    {/snippet}
    {#snippet fields()}
        <div class="space-y-2">
            <div class="flex flex-col gap-1">
                <div class="flex items-center justify-start gap-1">
                    <label for="roomName" class="text-sm text-slate-200">Room Name</label>
                    <Tooltip content={isPublic ? "Public Room" : "Private Room"} side="right">
                        <Switch bind:checked={isPublic} size="sm" />
                    </Tooltip>
                </div>
                <Input id="roomName" bind:value={inputValue} class="w-full" placeholder="My Room" max={20} onEnter={createRoom} bind:ref={input} />
            </div>
            <div class="flex flex-col gap-1">
                <label for="roomPassword" class="text-sm text-slate-200">Password (optional)</label>
                <Input
                    id="roomPassword"
                    bind:value={passwordValue}
                    class="w-full"
                    placeholder={"•".repeat(16)}
                    type="password"
                    onEnter={createRoom}
                />
            </div>
        </div>
    {/snippet}
    {#snippet actions()}
        <button
            class="not-disabled:hover:bg-green-500/10! not-disabled:hover:text-green-500 disabled:cursor-not-allowed"
            onclick={createRoom}
            disabled={!inputValue.trim() || $isCreatingRoom}
            class:!cursor-progress={$isCreatingRoom}
        >
            <MaterialSymbolsAdd2Rounded class="size-5" />
            Create
        </button>
    {/snippet}
</DialogPopup>
