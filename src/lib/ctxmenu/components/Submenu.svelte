<script lang="ts">
    import { formatShortcut, store } from "$lib/ctxmenu";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import CtxButton from "./CtxButton.svelte";

    let submenu: HTMLDivElement = $state(null!);

    async function handleActionClick(action: any, e: MouseEvent) {
        e.stopPropagation();

        if (action.disabled) return;

        try {
            await action.onclick();
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
        class="fixed z-[1001] flex min-w-48 flex-col items-start justify-center rounded-lg border border-slate-700 bg-slate-900/95 p-2 text-sm shadow-xl backdrop-blur-sm"
        style="top: {$store.submenu.y}px; left: {$store.submenu.x}px;"
    >
        <div in:fade={{ duration: 50 }} class="flex w-full flex-col items-start justify-center">
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
                        {#if action.image}
                            <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-700/20">
                                <img src={action.image} alt={action.label} class="size-full object-cover" loading="lazy" />
                            </div>
                        {:else if action.icon}
                            {@const IconComponent = action.icon}
                            <IconComponent class="size-5 shrink-0" />
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
