<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Switch from "$lib/components/ui/Switch.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import type { SelectRoomMember } from "$lib/db/schema";
    import type { UserData } from "$lib/discord/types";
    import { joinRoomAPI, leaveRoomAPI, toggleRoomVisibilityAPI } from "$lib/room";
    import { isJoiningRoom, store as popupStore, showJoinRoomPopup, showRoomDeletePopup, showRoomRenamePopup } from "$lib/stores";
    import { userRoomStore } from "$lib/stores/userRoom";
    import { supabaseChannel } from "$lib/supabase/channel";
    import { toast } from "svelte-sonner";
    import { fade, fly } from "svelte/transition";
    import IconParkOutlineLoadingFour from "~icons/icon-park-outline/loading-four";
    import LineMdConfirm from "~icons/line-md/confirm";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import SolarCopyOutline from "~icons/solar/copy-outline";
    import SolarLoginOutline from "~icons/solar/login-outline";
    import SolarLogoutOutline from "~icons/solar/logout-outline";
    import SolarRestartOutline from "~icons/solar/restart-outline";
    import SolarShareOutline from "~icons/solar/share-outline";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let enableToggleBtn: boolean = $state(true);
    let isPublic: boolean = $derived(data.room.isPublic);
    let members: UserData[] = $derived(data.room.members);
    let hoveredMemberId: string | null = $state(null);
    let hostAvatarHovered: boolean = $state(false);

    // Button feedback states
    let copyIdSuccess: boolean = $state(false);
    let shareSuccess: boolean = $state(false);

    // Thumbnail helpers for the room queue (limit to 4 thumbnails)
    const thumbnails = $derived(data.room.queue?.reverse().slice(0, 4) ?? []);

    // Short mappings for grid, spans and corner radii by thumbnail count
    const gridClass = $derived(
        thumbnails.length === 1 ? "grid-cols-1 grid-rows-1" : thumbnails.length === 2 ? "grid-cols-2 grid-rows-1" : "grid-cols-2 grid-rows-2",
    );
    const radiiByCount: Record<number, string[]> = {
        1: ["var(--radius-lg)"],
        2: ["var(--radius-lg) 0 0 var(--radius-lg)", "0 var(--radius-lg) var(--radius-lg) 0"],
        3: ["var(--radius-lg) var(--radius-lg) 0 0", "0 0 0 var(--radius-lg)", "0 0 var(--radius-lg) 0"],
        4: ["var(--radius-lg) 0 0 0", "0 var(--radius-lg) 0 0", "0 0 0 var(--radius-lg)", "0 0 var(--radius-lg) 0"],
    };

    async function toggleRoomVisibility() {
        toast.promise(
            (async () => {
                enableToggleBtn = false;
                try {
                    const resp = await toggleRoomVisibilityAPI(data.room.id);
                    if ("error" in resp) throw new Error(resp.error || "Failed to toggle room visibility");
                    isPublic = resp.isPublic;
                    return resp;
                } finally {
                    enableToggleBtn = true;
                }
            })(),
            {
                loading: "Toggling room visibility...",
                success: (data) => `Room is now ${data.isPublic ? "Public" : "Private"}`,
                error: (err) => String(err) || "Failed to toggle room visibility",
            },
        );
    }

    async function joinRoom() {
        toast.promise(
            (async () => {
                $isJoiningRoom = true;
                try {
                    const resp = await joinRoomAPI(data.room.id, "");
                    if ("error" in resp) throw new Error(resp.error || "Failed to join room");
                    return resp;
                } finally {
                    $isJoiningRoom = false;
                }
            })(),
            {
                loading: "Joining room...",
                success: (data) => {
                    invalidateAll();
                    return "Joined room successfully";
                },
                error: (err) => String(err) || "Failed to join room",
            },
        );
    }

    async function leaveRoom() {
        toast.promise(
            (async () => {
                const resp = await leaveRoomAPI(data.room.id);
                if ("error" in resp) throw new Error(resp.error || "Failed to leave room");
                return resp;
            })(),
            {
                loading: "Leaving room...",
                success: () => {
                    invalidateAll();
                    return "Left room successfully";
                },
                error: (err) => String(err) || "Failed to leave room",
            },
        );
    }

    $effect(() => {
        const channel = supabaseChannel(`room-${data.room.id}-updates`);
        channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "room", filter: `id=eq.${data.room.id}` }, () => {
            invalidateAll();
        });
        if ($userRoomStore) {
            channel.on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "room_member", filter: `room_id=eq.${data.room.id}` },
                (payload) => {
                    const newMember = payload.new as SelectRoomMember;
                    members = [...members, newMember.userData as UserData];
                },
            );
        }
        if (members.length > 0) {
            channel.on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "room_member", filter: `user_id=in.(${members.map((m) => m.id).join(",")})` },
                () => {
                    invalidateAll();
                },
            );
        }
        channel.subscribe();

        return () => {
            channel.unsubscribe();
        };
    });
</script>

{#if data.room.isPublic}
    <Seo title={`${data.room.name} Room`} description={`Created By ${data.room.hostUserData?.global_name}`} />
{:else}
    <Seo />
{/if}

<div class="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:items-stretch md:justify-start">
    <div class="grid size-40 shrink-0 rounded-lg bg-slate-800 md:size-50 {gridClass}">
        {#each thumbnails as song, idx}
            {@const span = thumbnails.length === 3 && idx === 0 ? "col-span-2" : ""}
            {@const borderRadius = radiiByCount[thumbnails.length]?.[idx] || radiiByCount[4][idx]}
            <div
                class="flex size-full items-center justify-center bg-slate-800 bg-cover bg-center {span}"
                style="background-image: url('{song?.thumbnail.LARGE}'); border-radius: {borderRadius};"
            ></div>
        {/each}
    </div>
    <div class="flex flex-col items-center justify-between gap-2 md:items-start md:self-stretch">
        <div class="flex h-full flex-col items-center justify-center gap-1 md:items-start">
            <div class="flex items-center justify-center gap-2 md:items-end">
                <h1
                    class="text-4xl font-bold"
                    class:md:text-6xl={data.room.name.length > 10 && data.room.name.length <= 20}
                    class:md:text-8xl={data.room.name.length <= 10}
                >
                    {data.room.name}
                </h1>
                {#if data.room.hostUserId === data.user?.id}
                    <Tooltip side="right" disabled={!enableToggleBtn} content="{isPublic ? 'Public' : 'Private'} Room">
                        <Switch size="md" checked={isPublic} disabled={!enableToggleBtn} onCheckedChange={toggleRoomVisibility} />
                    </Tooltip>
                {/if}
            </div>
            <div class="flex items-center justify-start gap-2 text-slate-400">
                <p>By</p>
                <a
                    href="/profile/{data.user?.id}"
                    class="flex items-center justify-start gap-1 hover:underline"
                    onmouseenter={() => (hostAvatarHovered = true)}
                    onmouseleave={() => (hostAvatarHovered = false)}
                >
                    <Avatar user={data.room.hostUserData} size="sm" animateOnHover={false} animateAvatar={hostAvatarHovered} />
                    <p>{data.room.hostUserData?.global_name}</p>
                </a>
            </div>
        </div>
        <div class="flex items-center justify-center gap-2">
            {#if data.room.hostUserId === data.user?.id}
                <Tooltip content="Delete Room" side="bottom">
                    <Button
                        size="icon"
                        class={!$popupStore.isRoomDeleting && !$popupStore.isRoomRenaming
                            ? "brightness-100! hover:bg-red-500/10! hover:text-red-500"
                            : ""}
                        disabled={$popupStore.isRoomDeleting || $popupStore.isRoomRenaming}
                        onclick={() => {
                            showRoomDeletePopup(data.room);
                        }}
                    >
                        {#if $popupStore.isRoomDeleting}
                            <span in:fade={{ duration: 100 }}>
                                <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                            </span>
                        {:else}
                            <span in:fade={{ duration: 100 }}>
                                <SolarTrashBinTrashLinear class="size-5" />
                            </span>
                        {/if}
                    </Button>
                </Tooltip>
                <Tooltip content="Rename Room" side="bottom">
                    <Button
                        size="icon"
                        disabled={$popupStore.isRoomDeleting || $popupStore.isRoomRenaming}
                        onclick={() => {
                            showRoomRenamePopup(data.room);
                        }}
                    >
                        {#if $popupStore.isRoomRenaming}
                            <span in:fade={{ duration: 100 }}>
                                <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                            </span>
                        {:else}
                            <span in:fade={{ duration: 100 }}>
                                <SolarRestartOutline class="size-5" />
                            </span>
                        {/if}
                    </Button>
                </Tooltip>
            {/if}
            <Tooltip content="Copy ID" side="bottom">
                <Button
                    size="icon"
                    onclick={() => {
                        navigator.clipboard.writeText(data.room.id);
                        copyIdSuccess = true;
                        setTimeout(() => (copyIdSuccess = false), 2000);
                    }}
                    class={copyIdSuccess ? "bg-green-500/10! brightness-100!" : ""}
                >
                    {#if copyIdSuccess}
                        <span in:fade={{ duration: 100 }}>
                            <LineMdConfirm class="size-5 text-green-500" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <SolarCopyOutline class="size-5" />
                        </span>
                    {/if}
                </Button>
            </Tooltip>
            <Tooltip content="Share" side="bottom">
                <Button
                    size="icon"
                    onclick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        shareSuccess = true;
                        setTimeout(() => (shareSuccess = false), 2000);
                    }}
                    class={shareSuccess ? "bg-green-500/10! brightness-100!" : ""}
                >
                    {#if shareSuccess}
                        <span in:fade={{ duration: 100 }}>
                            <LineMdConfirm class="size-5 text-green-500" />
                        </span>
                    {:else}
                        <span in:fade={{ duration: 100 }}>
                            <SolarShareOutline class="size-5" />
                        </span>
                    {/if}
                </Button>
            </Tooltip>
            {#if data.room.hostUserId !== data.user?.id}
                {@const isMember = members.some((member) => member.id === data.user?.id)}
                <Tooltip content={isMember ? "Leave" : "Join"} side="bottom">
                    <Button
                        size="icon"
                        onclick={() => {
                            if (isMember) {
                                leaveRoom();
                            } else {
                                if (data.room.hasPassword) {
                                    showJoinRoomPopup(data.room);
                                } else {
                                    joinRoom();
                                }
                            }
                        }}
                        disabled={$isJoiningRoom}
                        class={(isMember ? "hover:bg-red-500/10! hover:text-red-500" : "hover:bg-green-500/10! hover:text-green-500") +
                            ($isJoiningRoom ? "" : " brightness-100!") +
                            ($isJoiningRoom ? " cursor-progress!" : "")}
                    >
                        {#if isMember}
                            <div in:fly={{ x: -20 }}>
                                <SolarLogoutOutline class="size-5" />
                            </div>
                        {:else}
                            <div in:fly={{ x: -20 }}>
                                <SolarLoginOutline class="size-5" />
                            </div>
                        {/if}
                    </Button>
                </Tooltip>
            {/if}
        </div>
    </div>
</div>

<ul class="mt-2 flex list-none flex-col items-start justify-center gap-2 py-2 md:mt-5 md:py-5" class:!mt-20={members.length <= 0}>
    {#if members.length <= 0}
        <div in:fade={{ duration: 100 }} class="flex size-full items-center justify-center">
            <div class="flex flex-col items-center justify-center gap-2">
                <SolarConfoundedCircleLinear class="size-10 text-slate-400 md:size-15" />
                <p class="text-lg text-slate-400 md:text-xl">No members yet</p>
            </div>
        </div>
    {:else}
        {#each members as member (member.id)}
            <a
                in:fade={{ duration: 100 }}
                aria-label={member.global_name}
                href="/profile/{member.id}"
                class="flex items-center justify-center gap-2 rounded-lg bg-slate-800 p-4 transition-all duration-200"
                onmouseenter={() => (hoveredMemberId = member.id)}
                onmouseleave={() => (hoveredMemberId = null)}
            >
                <div class="flex size-full items-center justify-between gap-2">
                    <Avatar user={member} animateOnHover={false} animateAvatar={hoveredMemberId === member.id} />
                    <div class="flex flex-1 flex-col items-center justify-start gap-1">
                        <p>{member.global_name || member.username}</p>
                        <Badge role={member.role} size="xs" />
                    </div>
                </div>
            </a>
        {/each}
    {/if}
</ul>
