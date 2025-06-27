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
    let loginPopup: Window | null = null;

    function handleMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "LOGIN_SUCCESS") {
            if (loginPopup) {
                loginPopup.close();
                loginPopup = null;
            }
            invalidateAll();
        }
    }

    $effect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
            if (loginPopup && !loginPopup.closed) {
                loginPopup.close();
            }
        };
    });

    async function logout() {
        try {
            await fetch("/auth/logout");
            invalidateAll();
        } catch {}
    }

    async function deleteAcc() {
        deletePopupOpen = false;
        await fetch("/auth/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        invalidateAll();
    }

    async function handleLogin() {
        try {
            const response = await fetch("/auth/login");
            const data = await response.json();
            if (data.url) {
                loginPopup = window.open(
                    data.url,
                    "discord-login",
                    "width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no"
                );

                if (loginPopup) {
                    loginPopup.focus();
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    }
</script>

<div class="flex items-center justify-center">
    {#if user}
        <Popover side="bottom">
            {#snippet trigger()}
                <div class="relative flex size-10 cursor-pointer items-center justify-center md:size-12">
                    <img src={`https://cdn.discordapp.com/avatars/${user?.id}/${user?.avatar}`} alt="User Avatar" class="size-full rounded-full" />
                    {#if user?.avatar_decoration_data?.asset}
                        <img
                            src={`https://cdn.discordapp.com/avatar-decoration-presets/${user?.avatar_decoration_data?.asset}.webp`}
                            alt="Avatar Decoration"
                            class="absolute size-full rounded-full"
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
                    <p class="text-lg font-bold">{user?.global_name || user?.username}</p>
                    <span class="w-full border-t border-slate-700"></span>
                    <!-- Profile -->
                    <CtxButton href="/profile/{user?.id}">
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
        <Button onclick={handleLogin} class="font-bold">
            <SolarLogin2Linear class="size-5" />
            LOGIN
        </Button>
    {/if}
</div>
