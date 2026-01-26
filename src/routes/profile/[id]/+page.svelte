<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Seo from "$lib/components/ui/Seo.svelte";
    import Tooltip from "$lib/components/ui/Tooltip.svelte";
    import { ROLES } from "$lib/db";
    import { formatCount } from "$lib/utils/format";
    import { toast } from "svelte-sonner";
    import { expoOut } from "svelte/easing";
    import { fade, fly } from "svelte/transition";
    import IconParkOutlineClose from "~icons/icon-park-outline/close";
    import IconParkOutlineLoadingFour from "~icons/icon-park-outline/loading-four";
    import SolarCode2Linear from "~icons/solar/code-2-linear";
    import SolarCrownLineLinear from "~icons/solar/crown-line-linear";
    import SolarPenLinear from "~icons/solar/pen-linear";
    import SolarSledgehammerOutline from "~icons/solar/sledgehammer-outline";
    import SolarUserOutline from "~icons/solar/user-outline";

    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let role = $derived(data.user?.role || "user");
    let showRoleMenu = $state(false);
    let roleLoading = $state(false);
    async function setUserRole() {
        roleLoading = true;
        const response = await fetch(`/api/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: data.user?.id, role }),
        });

        if (response.ok) {
            await invalidateAll();
            showRoleMenu = false;
        } else {
            toast.error("Failed to update user role");
        }
        roleLoading = false;
    }
    const roleIcons = {
        owner: SolarCrownLineLinear,
        dev: SolarCode2Linear,
        staff: SolarSledgehammerOutline,
        user: SolarUserOutline,
    };

    let roles = $derived(
        ROLES.filter((roleValue) => {
            const currentUserRoleIndex = ROLES.indexOf(data.currentUser?.role || "user");
            const targetRoleIndex = ROLES.indexOf(roleValue);
            return targetRoleIndex >= currentUserRoleIndex;
        }).map((roleValue) => ({
            value: roleValue,
            label: roleValue.charAt(0).toUpperCase() + roleValue.slice(1),
            icon: roleIcons[roleValue],
        })),
    );
</script>

<Seo
    title={`${data.user?.global_name || data.user?.username}'s Profile`}
    image={data.user?.avatar ? `${data.user.url?.avatar}?size=4096` : undefined}
/>

<div class="flex flex-col items-center justify-start">
    <div class="w-full">
        {#if data.user?.url?.banner}
            <img src="{data.user.url.banner}?size=4096" alt="User Banner" class="h-20 w-full rounded-lg object-cover md:h-30 lg:h-40" />
        {:else}
            <div
                class="h-20 w-full rounded-lg md:h-30 lg:h-40"
                style="background-color: {data.user?.accent_color ? `#${data.user?.accent_color.toString(16).padStart(6, '0')}` : '#1F2937'};"
            ></div>
        {/if}
    </div>
    <div class="-mt-12 ml-10 flex w-full items-center justify-start gap-4">
        <div class="rounded-full border-8 border-slate-950 md:border-slate-900">
            <Avatar user={data.user} class="size-24 cursor-default md:size-32" size="" animateOnHover={false} animateAvatar />
        </div>
        <div class="mt-14 flex flex-col items-start justify-center">
            <div class="flex items-center justify-center gap-1">
                <p class="text-3xl font-bold md:text-4xl">{data.user?.global_name || data.user?.username}</p>
                {#if showRoleMenu}
                    <div in:fade={{ duration: 100 }} class="group flex items-center justify-center gap-2">
                        <Select
                            disabled={roleLoading}
                            bind:value={role}
                            onValueChange={setUserRole}
                            items={roles}
                            size="sm"
                            class={roleLoading ? "cursor-progress!" : ""}
                        />
                        <button
                            class="flex size-full cursor-pointer items-center justify-center text-slate-200 opacity-100 transition-opacity duration-200 group-hover:opacity-100"
                            disabled={roleLoading}
                            class:cursor-progress!={roleLoading}
                            class:brightness-80={roleLoading}
                            onclick={() => (showRoleMenu = false)}
                        >
                            {#if roleLoading}
                                <span in:fade={{ duration: 100 }}>
                                    <IconParkOutlineLoadingFour class="size-full animate-spin" />
                                </span>
                            {:else}
                                <span in:fade={{ duration: 100 }}>
                                    <IconParkOutlineClose class="size-full" />
                                </span>
                            {/if}
                        </button>
                    </div>
                {:else}
                    <div in:fade={{ duration: 100 }} class="group flex items-center justify-center gap-2">
                        <Badge role={data.user?.role} size="sm" />
                        {#if data.currentUser?.role === "owner" || data.currentUser?.role === "dev"}
                            <Tooltip content="Edit User Role">
                                <button
                                    class="flex cursor-pointer items-center justify-center text-slate-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                    onclick={() => (showRoleMenu = true)}
                                >
                                    <SolarPenLinear class="size-full" />
                                </button>
                            </Tooltip>
                        {/if}
                    </div>
                {/if}
            </div>
            <p class="font-mono text-sm text-slate-400">{data.user?.id}</p>
        </div>
    </div>
</div>

{#if data.playlists.length > 0}
    <h1 class="mt-10 text-3xl font-bold md:text-4xl">Public Playlists</h1>

    <div class="flex flex-wrap items-center justify-start gap-2 py-2 md:py-5">
        {#each data.playlists as playlist}
            <a
                in:fly={{ duration: 400, easing: expoOut, x: -100, y: 0 }}
                out:fly={{ duration: 400, easing: expoOut, x: 100, y: 0 }}
                href={`/playlist/${data.user?.id}/${playlist.id}`}
                class="group flex size-fit cursor-pointer flex-col items-start justify-center gap-2 rounded-lg p-3 transition-colors duration-200 hover:bg-slate-800"
            >
                <div
                    class="size-40 shrink-0 rounded-lg bg-slate-800 bg-cover transition-colors duration-200 group-hover:bg-slate-900 md:size-50"
                    style="background-image: url({playlist.cover});"
                ></div>
                <div class="flex w-40 items-center justify-between gap-2 text-sm md:w-50">
                    <p class="min-w-0 flex-1 truncate" title={playlist.name}>{playlist.name}</p>
                    {#if playlist.songs.length >= 1}
                        <p class="shrink-0 text-slate-400">{formatCount(playlist.songs.length)} songs</p>
                    {/if}
                </div>
            </a>
        {/each}
    </div>
{/if}
