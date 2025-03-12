<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import type { UserData } from "$lib/discord/types";
    import { AlertDialog, Popover } from "bits-ui";
    import { fade } from "svelte/transition";
    import SolarLogout2Linear from "~icons/solar/logout-2-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import SolarUserCircleLinear from "~icons/solar/user-circle-linear";
    import AlertPopup from "./AlertPopup.svelte";
    import SolarLogin2Linear from "~icons/solar/login-2-linear";
    import Button from "./Button.svelte";

    let { user }: { user: UserData | null } = $props();
    let deletePopupOpen = $state(false);

    async function logout() {
        try {
            await fetch("/auth/logout");
            invalidateAll();
        } catch {}
    }

    async function deleteAcc() {
        deletePopupOpen = false;
        try {
            await fetch("/auth/delete", { method: "POST" });
            invalidateAll();
        } catch {}
    }
</script>

<div>
    {#if user}
        <Popover.Root>
            <Popover.Trigger>
                <div class="flex items-center justify-center">
                    <img
                        src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                        alt="User Avatar"
                        class="size-8 rounded-full md:size-10"
                    />
                    {#if user.avatar_decoration_data?.asset}
                        <img
                            src={`https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data?.asset}.webp`}
                            alt="Avatar Decoration"
                            class="absolute z-10 size-10 rounded-full md:size-12"
                            onmouseenter={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = img.src.includes(".webp") ? img.src.replace(".webp", "") : `${img.src}.webp`;
                            }}
                            onmouseleave={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = img.src.includes(".webp") ? img.src.replace(".webp", "") : `${img.src}.webp`;
                            }}
                        />
                    {/if}
                </div>
            </Popover.Trigger>
            <Popover.Content
                class="z-50 m-2 flex min-w-45 flex-col items-start justify-center gap-1 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm *:not-first:rounded-lg *:not-first:not-[*:nth-child(2)]:not-last:flex *:not-first:not-[*:nth-child(2)]:not-last:w-full *:not-first:not-[*:nth-child(2)]:not-last:items-center *:not-first:not-[*:nth-child(2)]:not-last:justify-start *:not-first:not-[*:nth-child(2)]:not-last:gap-2 *:not-first:not-[*:nth-child(2)]:not-last:px-2 *:not-first:not-[*:nth-child(2)]:not-last:py-1.5 *:not-first:not-[*:nth-child(2)]:not-last:text-slate-200 *:not-first:not-[*:nth-child(2)]:not-last:transition-all *:not-first:not-[*:nth-child(2)]:not-last:duration-200 *:not-first:not-[*:nth-child(2)]:not-last:hover:bg-slate-800"
                forceMount
            >
                {#snippet child({ wrapperProps, props, open })}
                    {#if open}
                        <div {...wrapperProps}>
                            <div {...props} transition:fade={{ duration: 100 }}>
                                <p class="text-lg font-bold">{user.global_name || user.username}</p>
                                <span class="w-full border-t border-slate-700"></span>
                                <!-- Profile -->
                                <a href="/profile/{user.id}">
                                    <SolarUserCircleLinear class="size-5" />
                                    Profile
                                </a>
                                <!-- Logout -->
                                <button onclick={logout} class="cursor-pointer">
                                    <SolarLogout2Linear class="size-5" />
                                    Logout
                                </button>
                                <!-- Delete -->
                                <AlertPopup title="ARE YOU SURE?" bind:open={deletePopupOpen}>
                                    {#snippet trigger()}
                                        <button
                                            class="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg px-2 py-1.5 text-slate-200 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
                                        >
                                            <SolarTrashBinTrashLinear class="size-5" />
                                            Delete Account
                                        </button>
                                    {/snippet}
                                    {#snippet description()}
                                        This action cannot be undone. This will permanently
                                        <span class="font-semibold text-red-500">delete your account</span>
                                        and all associated data. Please confirm that you want to proceed.
                                    {/snippet}
                                    {#snippet actions()}
                                        <AlertDialog.Action class="hover:!bg-red-500/10 hover:text-red-500" onclick={deleteAcc}>
                                            <SolarTrashBinTrashLinear class="size-5" />
                                            Delete Account
                                        </AlertDialog.Action>
                                    {/snippet}
                                </AlertPopup>
                            </div>
                        </div>
                    {/if}
                {/snippet}
            </Popover.Content>
        </Popover.Root>
    {:else}
        <Button href="/auth/login" class="font-bold">
            <SolarLogin2Linear class="size-5" />
            LOGIN
        </Button>
    {/if}
</div>
