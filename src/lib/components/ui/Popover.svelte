<script lang="ts">
    /**
     * - Automatically switches to mobile drawer on mobile devices
     * - Title shown only in mobile drawer
     * - Desktop view is clean without titles
     * - Default styling for list-style content (min-w-48, flex-col, gap-1)
     * - Optimized for CtxButton components
     *
     * Usage:
     * <Popover title="Account Menu">
     *   {#snippet trigger()}<button>Click me</button>{/snippet}
     *       {#snippet content()}
     *           <CtxButton>Profile</CtxButton>
     *           <CtxButton>Settings</CtxButton>
     *       {/snippet}
     *    {/snippet}
     * </Popover>
     */
    import { cn } from "$lib/utils/cn";
    import { createMobileMediaQuery } from "$lib/utils/mobile";
    import { Popover } from "bits-ui";
    import type { Snippet } from "svelte";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import MobileDrawer from "./MobileDrawer.svelte";

    interface Props {
        side?: "top" | "right" | "bottom" | "left" | undefined;
        arrow?: boolean;
        open?: boolean;
        trigger: Snippet;
        content: Snippet;
        title?: string;
        contentClass?: string;
        mobileContentClass?: string;
        maxHeight?: string;
        fullScreen?: boolean;
    }
    let {
        side = undefined,
        arrow = false,
        open = $bindable(false),
        trigger,
        content,
        title = "Menu",
        contentClass = "",
        mobileContentClass = "",
        maxHeight = "max-h-96",
        fullScreen = false,
    }: Props = $props();

    let isMobile = $state(false);

    onMount(() => {
        const cleanup = createMobileMediaQuery((mobile) => {
            isMobile = mobile;
        });

        return cleanup;
    });

    function handleMobileClose() {
        open = false;
    }
</script>

{#if isMobile}
    <!-- Mobile drawer -->
    <div
        role="button"
        tabindex="0"
        onclick={() => {
            open = true;
        }}
        onkeydown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open = true;
            }
        }}
    >
        {@render trigger()}
    </div>
    <MobileDrawer {open} onClose={handleMobileClose} {title} zIndex={803} {maxHeight} {fullScreen} contentClass={mobileContentClass}>
        {@render content()}
    </MobileDrawer>
{:else}
    <!-- Desktop popover -->
    <Popover.Root bind:open>
        <Popover.Trigger>
            {@render trigger()}
        </Popover.Trigger>
        <Popover.Portal>
            <Popover.Content
                {side}
                class={cn(
                    "z-50 flex min-w-48 flex-col items-start justify-center overflow-hidden rounded-lg border border-slate-700 bg-slate-900 text-sm",
                    maxHeight,
                    contentClass,
                )}
                sideOffset={8}
                forceMount
            >
                {#snippet child({ wrapperProps, props, open })}
                    {#if open}
                        <div {...wrapperProps}>
                            <div {...props} transition:fade={{ duration: 100 }}>
                                <div class="flex w-full flex-col items-start overflow-x-hidden overflow-y-auto p-2">
                                    {@render content()}
                                </div>
                                {#if arrow}
                                    <Popover.Arrow class="text-slate-700" />
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/snippet}
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>
{/if}
