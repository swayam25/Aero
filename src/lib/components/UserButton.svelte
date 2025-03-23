<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import type { UserData } from "$lib/discord/types";
    import { AlertDialog } from "bits-ui";
    import SolarLogin2Linear from "~icons/solar/login-2-linear";
    import SolarLogout2Linear from "~icons/solar/logout-2-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import SolarUserCircleLinear from "~icons/solar/user-circle-linear";
    import CtxButton from "./CtxButton.svelte";
    import AlertPopup from "./ui/AlertPopup.svelte";
    import Button from "./ui/Button.svelte";
    import Popover from "./ui/Popover.svelte";

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
        await fetch("/auth/delete", { method: "POST" });
        invalidateAll();
    }
</script>

<div>
    {#if user}
        <Popover side="bottom">
            {#snippet trigger()}
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
                            class="absolute size-10 rounded-full md:size-12"
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
            {/snippet}
            {#snippet content()}
                <div class="flex flex-col items-start justify-center gap-1">
                    <p class="text-lg font-bold">{user.global_name || user.username}</p>
                    <span class="w-full border-t border-slate-700"></span>
                    <!-- Profile -->
                    <CtxButton href="/profile/{user.id}">
                        <SolarUserCircleLinear class="size-5" />
                        Profile
                    </CtxButton>
                    <!-- Logout -->
                    <CtxButton onclick={logout}>
                        <SolarLogout2Linear class="size-5" />
                        Logout
                    </CtxButton>
                    <!-- Delete -->
                    <AlertPopup title="ARE YOU SURE?" bind:open={deletePopupOpen}>
                        {#snippet trigger()}
                            <CtxButton type="error">
                                <SolarTrashBinTrashLinear class="size-5" />
                                Delete Account
                            </CtxButton>
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
            {/snippet}
        </Popover>
    {:else}
        <Button href="/auth/login" class="font-bold">
            <SolarLogin2Linear class="size-5" />
            LOGIN
        </Button>
    {/if}
</div>
