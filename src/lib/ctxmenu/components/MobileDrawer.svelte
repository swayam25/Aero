<script lang="ts">
    import { closeCtxMenu, createErrorAction, createLoadingActions, isSubmenuLoader, store } from "$lib/ctxmenu";
    import type { CtxAction } from "$lib/ctxmenu/types";
    import { toast } from "svelte-sonner";
    import { Drawer } from "vaul-svelte";
    import SolarAltArrowRightLinear from "~icons/solar/alt-arrow-right-linear";
    import SolarConfoundedCircleLinear from "~icons/solar/confounded-circle-linear";
    import CtxButton from "./CtxButton.svelte";

    let submenuStack: CtxAction[][] = $state([]);
    let currentTitle = $state("");
    let loadingSubmenu = $state(false);

    // Reset state when drawer opens/closes
    $effect(() => {
        if (!$store.isOpen) {
            submenuStack = [];
            currentTitle = "";
            loadingSubmenu = false;
        }
    });

    async function handleActionClick(action: any, e: MouseEvent) {
        e.stopPropagation();

        if (action.disabled) return;

        // If action has submenu, navigate to it
        if (action.submenu) {
            await navigateToSubmenu(action);
            return;
        }

        try {
            await action.onclick();
            closeCtxMenu();
        } catch (error) {
            console.error("Error executing context action:", error);
            toast.error("An error occurred");
        }
    }

    async function navigateToSubmenu(action: any) {
        if (!action.submenu) return;

        loadingSubmenu = true;

        try {
            // Check if this is a dynamic submenu loader
            if (isSubmenuLoader(action.submenu)) {
                const loader = action.submenu;

                // Show loading state
                const loadingActions = createLoadingActions(loader.loadingItems || 3, loader.loadingLabel || "Loading...");
                submenuStack = [...submenuStack, $store.actions];
                $store.actions = loadingActions;
                currentTitle = action.label;

                // Load actual submenu content
                try {
                    const submenuActions: CtxAction[] = await loader.loader();
                    $store.actions = submenuActions;
                } catch (error) {
                    console.error("Failed to load submenu:", error);
                    const errorAction = createErrorAction(loader.errorLabel || "Failed to load", SolarConfoundedCircleLinear);
                    $store.actions = [errorAction];
                }
            } else if (Array.isArray(action.submenu) && action.submenu.length > 0) {
                // Static submenu
                submenuStack = [...submenuStack, $store.actions];
                $store.actions = action.submenu;
                currentTitle = action.label;
            }
        } finally {
            loadingSubmenu = false;
        }
    }

    function navigateBack() {
        if (submenuStack.length > 0) {
            const previousActions = submenuStack.pop();
            if (previousActions) {
                $store.actions = previousActions;
                submenuStack = submenuStack; // Trigger reactivity
                currentTitle = submenuStack.length > 0 ? "Back" : "";
            }
        }
    }

    function handleClose() {
        closeCtxMenu();
    }
</script>

<Drawer.Root open={$store.isOpen} onClose={handleClose}>
    <Drawer.Portal>
        <Drawer.Overlay class="fixed inset-0 z-[999] bg-black/50" />
        <Drawer.Content class="fixed inset-x-0 bottom-0 z-[1000] mt-24 flex h-fit flex-col rounded-t-2xl border-t border-slate-700 bg-slate-900">
            <!-- Handle -->
            <div class="mx-auto mt-4 h-2 w-12 rounded-full bg-slate-600"></div>

            <!-- Header -->
            <div class="flex items-center justify-center py-5">
                {#if currentTitle}
                    <h2 class="text-sm font-medium text-slate-200">{currentTitle}</h2>
                {:else}
                    <h2 class="text-sm font-medium text-slate-200">Menu</h2>
                {/if}
            </div>

            <!-- Content -->
            <div class="max-h-96 overflow-y-auto px-4 pb-8">
                <div class="flex flex-col gap-1">
                    {#each $store.actions as action, index}
                        <CtxButton
                            type={action.type || "normal"}
                            disabled={action.disabled}
                            onclick={(e) => handleActionClick(action, e)}
                            class="p-3"
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
                                <div class="flex flex-1 flex-col text-left">
                                    <span class="font-medium">{action.label}</span>
                                    {#if action.description}
                                        <span class="text-xs text-slate-400">{action.description}</span>
                                    {/if}
                                </div>
                                {#if action.submenu && (Array.isArray(action.submenu) ? action.submenu.length > 0 : true)}
                                    <!-- Submenu indicator arrow -->
                                    <SolarAltArrowRightLinear class="ml-2 size-4" />
                                {/if}
                            {/if}
                        </CtxButton>

                        {#if action.separator && index < $store.actions.length - 1}
                            <div class="my-2 border-t border-slate-700"></div>
                        {/if}
                    {/each}
                </div>
            </div>
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root>
