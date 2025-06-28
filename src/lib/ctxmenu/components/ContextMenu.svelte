<script lang="ts">
    import { closeCtxMenu, formatShortcut, store } from "$lib/ctxmenu";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import CtxButton from "./CtxButton.svelte";

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
                closeCtxMenu();
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

        try {
            await action.onclick();
        } catch (error) {
            console.error("Error executing context action:", error);
            toast.error("An error occurred");
        }
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
                <CtxButton type={action.type || "normal"} disabled={action.disabled} onclick={(e) => handleActionClick(action, e)}>
                    {#if action.icon}
                        {@const IconComponent = action.icon}
                        <IconComponent class="size-5 shrink-0" />
                    {/if}
                    <span class="flex-1 text-left">{action.label}</span>
                    {#if action.shortcut}
                        <span class="ml-2 text-xs text-slate-400">
                            {formatShortcut(action.shortcut)}
                        </span>
                    {/if}
                </CtxButton>

                {#if action.separator && index < $store.actions.length - 1}
                    <div class="my-1 w-full border-t border-slate-700"></div>
                {/if}
            {/each}
        </div>
    </div>
{/if}
