<script lang="ts">
    import {
        closeCtxMenu,
        closeSubmenu,
        createErrorAction,
        createLoadingActions,
        formatShortcut,
        isSubmenuLoader,
        openSubmenu,
        store
    } from "$lib/ctxmenu";
    import type { CtxAction } from "$lib/ctxmenu/types";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import CtxButton from "./CtxButton.svelte";
    import Submenu from "./Submenu.svelte";
    // Import icons for error states
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";

    let ctxMenu: HTMLDivElement = $state(null!);
    let x: number = $state(0);
    let y: number = $state(0);

    // Calculate position
    $effect(() => {
        if ($store.isOpen && ctxMenu) {
            const { offsetHeight: menuHeight, offsetWidth: menuWidth } = ctxMenu;

            // Adjust vertical position
            if ($store.y + menuHeight > window.innerHeight - 72) {
                y = Math.max($store.y - menuHeight, 50);
            } else {
                y = $store.y;
            }

            // Adjust horizontal position
            if ($store.x + menuWidth > window.innerWidth) {
                x = Math.max($store.x - menuWidth, 50);
            } else {
                x = $store.x;
            }
        }
    });

    // Prevent body and queue scrolling when menu is open
    $effect(() => {
        const bodyElement = document.getElementById("body");
        const queueElement = document.getElementById("queue");
        if ($store.isOpen) {
            if (bodyElement) {
                bodyElement.style.overflow = "hidden";
            }
            if (queueElement) {
                queueElement.style.overflow = "hidden";
            }
            document.body.style.overflow = "hidden";
        } else {
            if (bodyElement) {
                bodyElement.style.overflow = "";
            }
            if (queueElement) {
                queueElement.style.overflow = "";
            }
            document.body.style.overflow = "";
        }
    });

    // Close menu on click outside
    onMount(() => {
        function handleClickOutside(e: MouseEvent) {
            if ($store.isOpen && ctxMenu && !ctxMenu.contains(e.target as Node)) {
                // Also check if click is outside submenu
                const submenuElement = document.querySelector("[data-submenu]");
                if (!submenuElement || !submenuElement.contains(e.target as Node)) {
                    closeCtxMenu();
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    });

    async function handleActionClick(action: any, e: MouseEvent) {
        e.stopPropagation();

        if (action.disabled) return;

        // If action has submenu, don't execute onclick, just handle submenu
        if (action.submenu) {
            return;
        }

        try {
            await action.onclick();
        } catch (error) {
            console.error("Error executing context action:", error);
            toast.error("An error occurred");
        }
    }

    function handleMouseEnter(action: any, index: number, buttonElement: HTMLElement) {
        if (action.submenu !== undefined) {
            const rect = buttonElement.getBoundingClientRect();

            // Check if this is a dynamic submenu loader
            if (isSubmenuLoader(action.submenu)) {
                const loader = action.submenu;

                // Show loading state first
                const loadingActions = createLoadingActions(loader.loadingItems || 3, loader.loadingLabel || "Loading...");
                openSubmenu(index, loadingActions, rect);

                // Load actual submenu content
                loader
                    .loader()
                    .then((submenuActions: CtxAction[]) => {
                        openSubmenu(index, submenuActions, rect);
                    })
                    .catch((error: Error) => {
                        console.error("Failed to load submenu:", error);
                        const errorAction = createErrorAction(loader.errorLabel || "Failed to load", SolarConfoundedCircleLinear);
                        openSubmenu(index, [errorAction], rect);
                    });
            } else if (Array.isArray(action.submenu) && action.submenu.length > 0) {
                // Static submenu
                openSubmenu(index, action.submenu, rect);
            }
        } else {
            closeSubmenu();
        }
    }

    function handleMouseLeave() {
        // Add small delay before closing submenu to allow moving to submenu
        setTimeout(() => {
            if (!document.querySelector("[data-submenu]:hover") && !document.querySelector("[data-ctx-button]:hover")) {
                closeSubmenu();
            }
        }, 100);
    }
</script>

{#if $store.isOpen}
    <div
        transition:fade={{ duration: 150 }}
        bind:this={ctxMenu}
        class="fixed z-[1000] flex min-w-48 flex-col items-start justify-center rounded-lg border border-slate-700 bg-slate-900/95 p-2 text-sm shadow-xl backdrop-blur-sm"
        style="top: {y}px; left: {x}px;"
    >
        <div in:fade={{ duration: 100 }} class="flex w-full flex-col items-start justify-center">
            {#each $store.actions as action, index}
                <CtxButton
                    type={action.type || "normal"}
                    disabled={action.disabled}
                    onclick={(e) => handleActionClick(action, e)}
                    onmouseenter={(e) => handleMouseEnter(action, index, e.currentTarget as HTMLElement)}
                    onmouseleave={handleMouseLeave}
                    class="items-center justify-center"
                    data-ctx-button
                >
                    {#if action.type === "skeleton"}
                        <!-- Skeleton loading state with staggered animation -->
                        <div class="size-10 shrink-0 animate-pulse rounded bg-slate-700/60" style="animation-delay: {index * 0.1}s"></div>
                        <div class="h-5 flex-1 animate-pulse rounded bg-slate-700/60" style="animation-delay: {index * 0.1 + 0.05}s"></div>
                    {:else}
                        {#if action.image}
                            <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-700/20">
                                <img src={action.image} alt={action.label} class="size-full object-cover" loading="lazy" />
                            </div>
                        {:else if action.icon}
                            {@const IconComponent = action.icon}
                            <IconComponent class="size-5 shrink-0" />
                        {/if}
                        <span class="flex-1 text-left">{action.label}</span>
                        {#if action.submenu && (Array.isArray(action.submenu) ? action.submenu.length > 0 : true)}
                            <!-- Submenu indicator arrow -->
                            <svg class="ml-2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        {:else if action.shortcut}
                            <span class="ml-2 text-xs text-slate-400">
                                {formatShortcut(action.shortcut)}
                            </span>
                        {/if}
                    {/if}
                </CtxButton>

                {#if action.separator && index < $store.actions.length - 1}
                    <div class="my-1 w-full border-t border-slate-700"></div>
                {/if}
            {/each}
        </div>
    </div>

    <!-- Submenu component -->
    <Submenu />
{/if}
