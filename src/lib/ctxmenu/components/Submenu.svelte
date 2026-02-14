<script lang="ts">
    import { closeCtxMenu, formatShortcut, store } from "$lib/ctxmenu";
    import type { CtxAction } from "$lib/ctxmenu/types";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import CtxButton from "./CtxButton.svelte";
    import Thumbnail from "$lib/components/Thumbnail.svelte";

    let submenu: HTMLDivElement = $state(null!);

    async function handleActionClick(action: CtxAction, e: MouseEvent) {
        e.stopPropagation();

        if (action.disabled) return;

        try {
            await action.onclick({ closeMenu: closeCtxMenu }); // Submenu actions don't typically need closeMenu context
        } catch (error) {
            console.error("Error executing submenu action:", error);
            toast.error("An error occurred");
        }
    }
</script>

{#if $store.submenu?.isOpen}
    <div
        transition:fade={{ duration: 100 }}
        bind:this={submenu}
        data-submenu
        class="fixed z-1000 flex max-h-96 min-w-48 flex-col items-start justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900 text-sm shadow-xl"
        style="top: {$store.submenu.y}px; left: {$store.submenu.x}px;"
    >
        <div class="flex w-full flex-col items-start overflow-x-hidden overflow-y-auto p-2">
            {#each $store.submenu.actions as action, index}
                <CtxButton
                    type={action.type || "normal"}
                    disabled={action.disabled}
                    onclick={(e) => handleActionClick(action, e)}
                    class="items-center justify-center"
                >
                    {#if action.type === "skeleton"}
                        <!-- Skeleton loading state with staggered animation -->
                        <div class="size-10 shrink-0 animate-pulse rounded bg-slate-700/60" style="animation-delay: {index * 0.1}s"></div>
                        <div class="h-5 flex-1 animate-pulse rounded bg-slate-700/60" style="animation-delay: {index * 0.1 + 0.05}s"></div>
                    {:else}
                        {#if action.icon}
                            {@const IconComponent = action.icon}
                            <IconComponent class="size-5 shrink-0" />
                        {:else}
                            <Thumbnail
                                src={action.image || ""}
                                alt={action.label}
                                class="size-10 shrink-0 rounded-lg transition-colors duration-200"
                            />
                        {/if}
                        <span class="flex-1 text-left">{action.label}</span>
                        {#if action.shortcut}
                            <span class="ml-2 text-xs text-slate-400">
                                {formatShortcut(action.shortcut)}
                            </span>
                        {/if}
                    {/if}
                </CtxButton>

                {#if action.separator && index < $store.submenu.actions.length - 1}
                    <div class="my-1 w-full border-t border-slate-700"></div>
                {/if}
            {/each}
        </div>
    </div>
{/if}
