<script lang="ts">
    import NewRoomPopup from "$lib/components/NewRoomPopup.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { createRoomActions, openCtxMenu } from "$lib/ctxmenu";
    import type { SelectRoom } from "$lib/db/schema";
    import { isCreatingRoom, isJoiningRoom, showJoinRoomPopup } from "$lib/stores";
    import { supabaseChannel } from "$lib/supabase/channel";
    import { formatCount } from "$lib/utils/format";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import MaterialSymbolsAdd2Rounded from "~icons/material-symbols/add-2-rounded";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarLoginLinear from "~icons/solar/login-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    let rooms: SelectRoom[] = $derived(data.rooms);
    let publicRooms: SelectRoom[] = $derived(rooms.filter((room) => room.isPublic));

    $effect(() => {
        const channel = supabaseChannel("room-changes-rooms")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "room",
                },
                (payload) => {
                    const newRoom = payload.new as Partial<SelectRoom>;
                    rooms = rooms.map((room: SelectRoom) => {
                        if (room.id === newRoom.id) {
                            return { ...room, ...newRoom } as SelectRoom;
                        }
                        return room;
                    });
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "room",
                },
                (payload) => {
                    const newRoom = payload.new as SelectRoom;
                    rooms = [newRoom, ...rooms];
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "room",
                },
                (payload) => {
                    const normalizedOld = payload.old as { id: string };
                    rooms = rooms.filter((r) => r.id !== normalizedOld.id);
                },
            )
            .subscribe();
        return () => {
            if (channel) channel.unsubscribe();
        };
    });

    const radiiByCount: Record<number, string[]> = {
        1: ["var(--radius-lg)"],
        2: ["var(--radius-lg) 0 0 var(--radius-lg)", "0 var(--radius-lg) var(--radius-lg) 0"],
        3: ["var(--radius-lg) var(--radius-lg) 0 0", "0 0 0 var(--radius-lg)", "0 0 var(--radius-lg) 0"],
        4: ["var(--radius-lg) 0 0 0", "0 var(--radius-lg) 0 0", "0 0 0 var(--radius-lg)", "0 0 var(--radius-lg) 0"],
    };
</script>

<Seo title="Rooms" />

{#if publicRooms.length > 0}
    <div in:fade={{ duration: 100 }} class="mb-2 flex size-fit items-center justify-center gap-2 md:mb-5">
        <h1 class="text-3xl font-bold md:text-4xl">Rooms</h1>
        <NewRoomPopup>
            <Tooltip side="bottom" content="New Room">
                <Button size="icon" type="div" disabled={$isCreatingRoom || $isJoiningRoom}>
                    <MaterialSymbolsAdd2Rounded class="size-5" />
                </Button>
            </Tooltip>
        </NewRoomPopup>
        <Tooltip side="bottom" content="Join Room">
            <Button size="icon" type="div" disabled={$isJoiningRoom || $isCreatingRoom} onclick={showJoinRoomPopup}>
                <SolarLoginLinear class="size-5" />
            </Button>
        </Tooltip>
    </div>
{/if}

{#if publicRooms.length <= 0}
    <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
        <div class="flex flex-col items-center justify-center gap-2">
            <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
            <p class="text-lg text-slate-400 md:text-xl">No rooms found</p>
            <NewRoomPopup>
                <Button disabled={$isCreatingRoom || $isJoiningRoom}>
                    <MaterialSymbolsAdd2Rounded class="size-5" />
                    <span>Create New</span>
                </Button>
            </NewRoomPopup>
            <Button disabled={$isJoiningRoom || $isCreatingRoom} onclick={showJoinRoomPopup}>
                <SolarLoginLinear class="size-5" />
                <span>Join</span>
            </Button>
        </div>
    </div>
{:else}
    <div in:fade={{ duration: 100 }} class="flex flex-wrap items-center justify-start gap-2">
        {#each publicRooms as room}
            {@const thumbnails = room.queue?.reverse().slice(0, 4) ?? []}
            {@const gridClass =
                thumbnails.length === 1 ? "grid-cols-1 grid-rows-1" : thumbnails.length === 2 ? "grid-cols-2 grid-rows-1" : "grid-cols-2 grid-rows-2"}
            <a
                in:fly={{ duration: 500, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 500, easing: expoOut, x: 100, y: 0 }}
                href={`/room/${room.id}`}
                oncontextmenu={(e) => {
                    e.preventDefault();
                    const actions = createRoomActions(room, room.hostUserId === data.user?.id);
                    openCtxMenu(e, actions);
                }}
                class="group flex size-fit cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
            >
                <div
                    class="grid size-40 shrink-0 rounded-lg bg-slate-800 transition-colors duration-200 group-hover:bg-slate-900 md:size-50 {gridClass}"
                >
                    {#each thumbnails as song, idx}
                        {@const span = thumbnails.length === 3 && idx === 0 ? "col-span-2" : ""}
                        {@const borderRadius = radiiByCount[thumbnails.length]?.[idx] || radiiByCount[4][idx]}
                        <div
                            class="flex size-full items-center justify-center bg-slate-800 bg-cover bg-center transition-colors duration-200 group-hover:bg-slate-900 {span}"
                            style="background-image: url('{song?.thumbnail.LARGE}'); border-radius: {borderRadius};"
                        ></div>
                    {/each}
                </div>
                <div class="flex w-40 items-center justify-between gap-2 text-sm md:w-50">
                    <p class="min-w-0 flex-1 truncate" title={room.name}>{room.name}</p>
                    {#if room.queue.length >= 1}
                        <p class="shrink-0 text-slate-400">{formatCount(room.queue.length)} songs</p>
                    {/if}
                </div>
            </a>
        {/each}
    </div>
{/if}
