<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import type { UserData } from "$lib/discord/types";
    import { AlertDialog } from "bits-ui";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import IconParkOutlineLoadingFour from "~icons/icon-park-outline/loading-four";
    import SolarLogin2Linear from "~icons/solar/login-2-linear";
    import SolarLogout2Linear from "~icons/solar/logout-2-linear";
    import SolarTrashBinTrashLinear from "~icons/solar/trash-bin-trash-linear";
    import SolarUserCircleLinear from "~icons/solar/user-circle-linear";
    import CtxButton from "../ctxmenu/components/CtxButton.svelte";
    import AlertPopup from "./ui/AlertPopup.svelte";
    import Avatar from "./ui/Avatar.svelte";
    import Button from "./ui/Button.svelte";
    import Popover from "./ui/Popover.svelte";

    let { user, mobile = false }: { user: UserData | null; mobile?: boolean } = $props();
    let deletePopupOpen = $state(false);
    let loginPopup: Window | null = null;
    let popupCheckInterval: number | null = null;
    let isLoggingIn = $state(false);

    async function handleMessage(event: MessageEvent) {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "LOGIN_SUCCESS") {
            if (loginPopup) {
                loginPopup.close();
                loginPopup = null;
            }
            if (popupCheckInterval) {
                clearInterval(popupCheckInterval);
                popupCheckInterval = null;
            }
            isLoggingIn = false;
            toast.loading("Fetching user data...", { id: "login" });
            await invalidateAll();
            toast.success("Logged in successfully!", { id: "login" });
        }
    }

    $effect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
            if (loginPopup && !loginPopup.closed) {
                loginPopup.close();
            }
            if (popupCheckInterval) {
                clearInterval(popupCheckInterval);
            }
        };
    });

    let isLoggingOut = $state(false);
    async function logout() {
        if (isLoggingOut) return;
        isLoggingOut = true;
        try {
            await fetch("/auth/logout");
            await invalidateAll();
        } catch {
        } finally {
            isLoggingOut = false;
        }
    }

    let isDeleting = $state(false);
    async function deleteAcc() {
        if (isDeleting) return;
        isDeleting = true;
        await fetch("/auth/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        await invalidateAll();
        isDeleting = false;
        deletePopupOpen = false;
    }

    async function handleLogin() {
        if (isLoggingIn) return;
        isLoggingIn = true;
        try {
            const response = await fetch("/auth/login");
            const data = await response.json();
            if (data.url) {
                loginPopup = window.open(
                    data.url,
                    "discord-login",
                    "width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no",
                );

                if (loginPopup) {
                    loginPopup.focus();

                    // Check if popup is closed (user cancelled)
                    popupCheckInterval = window.setInterval(() => {
                        if (loginPopup && loginPopup.closed) {
                            clearInterval(popupCheckInterval!);
                            popupCheckInterval = null;
                            loginPopup = null;
                            isLoggingIn = false;
                        }
                    }, 500);
                } else {
                    // Popup was blocked
                    isLoggingIn = false;
                }
            } else {
                isLoggingIn = false;
            }
        } catch (error) {
            console.error("Login failed:", error);
            isLoggingIn = false;
        }
    }
</script>

{#snippet menuContent()}
    <!-- Profile -->
    <CtxButton href="/profile/{user?.id}">
        <SolarUserCircleLinear class="size-5" />
        Profile
    </CtxButton>
    <!-- Logout -->
    <CtxButton onclick={logout} disabled={isLoggingOut}>
        {#if isLoggingOut}
            <IconParkOutlineLoadingFour class="size-5 animate-spin" />
        {:else}
            <SolarLogout2Linear class="size-5" />
        {/if}
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
            <span class="font-medium text-red-500">delete your account</span>
            and all associated data. Please confirm that you want to proceed.
        {/snippet}
        {#snippet actions()}
            <AlertDialog.Action
                class="hover:bg-red-500/10! hover:text-red-500 {isDeleting ? 'cursor-progress! bg-red-500/10! text-red-500' : ''}"
                disabled={isDeleting}
                onclick={deleteAcc}
            >
                {#if isDeleting}
                    <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                {:else}
                    <SolarTrashBinTrashLinear class="size-5" />
                {/if}
                Delete Account
            </AlertDialog.Action>
        {/snippet}
    </AlertPopup>
{/snippet}

{#if mobile}
    {#if user}
        <Popover side="top" title="Account Menu">
            {#snippet trigger()}
                <button class="flex cursor-pointer flex-col items-center justify-center gap-1 text-slate-200">
                    <Avatar {user} size="" class="size-6" animateOnHover={false} />
                    <p class="text-xs font-medium">Account</p>
                </button>
            {/snippet}
            {#snippet content()}
                {@render menuContent()}
            {/snippet}
        </Popover>
    {:else}
        <button onclick={handleLogin} class="flex cursor-pointer flex-col items-center justify-center gap-1 text-slate-200">
            <SolarLogin2Linear class="size-6" />
            <p class="text-xs font-medium">Login</p>
        </button>
    {/if}
{:else}
    <div class="flex items-center justify-center">
        {#if user}
            <Popover side="bottom" title="Account Menu">
                {#snippet trigger()}
                    <Avatar {user} />
                {/snippet}
                {#snippet content()}
                    {@render menuContent()}
                {/snippet}
            </Popover>
        {:else}
            <Button onclick={handleLogin} class="font-bold" disabled={isLoggingIn}>
                {#if isLoggingIn}
                    <span in:fade={{ duration: 100 }}>
                        <IconParkOutlineLoadingFour class="size-5 animate-spin" />
                    </span>
                {:else}
                    <span in:fade={{ duration: 100 }}>
                        <SolarLogin2Linear class="size-5" />
                    </span>
                {/if}
                LOGIN
            </Button>
        {/if}
    </div>
{/if}
