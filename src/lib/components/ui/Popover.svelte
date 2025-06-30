<script lang="ts">
    import { Popover } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        side?: "top" | "right" | "bottom" | "left" | undefined;
        arrow?: boolean;
        open?: boolean;
        trigger: Snippet;
        content: Snippet;
    }
    let { side = undefined, arrow = false, open = $bindable(false), trigger, content }: Props = $props();
</script>

<Popover.Root bind:open>
    <Popover.Trigger>
        {@render trigger()}
    </Popover.Trigger>
    <Popover.Portal>
        <Popover.Content {side} class="z-50 min-w-45 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm" sideOffset={8} forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fade={{ duration: 100 }}>
                            {@render content()}
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
