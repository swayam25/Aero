<script lang="ts">
    import { Popover } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        trigger: Snippet;
        content: Snippet;
        side?: "top" | "right" | "bottom" | "left" | undefined;
    }
    let { trigger, content, side = undefined }: Props = $props();
</script>

<Popover.Root>
    <Popover.Trigger>
        {@render trigger()}
    </Popover.Trigger>
    <Popover.Portal>
        <Popover.Content {side} class="z-50 m-2 min-w-45 rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm" forceMount>
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fade={{ duration: 100 }}>
                            {@render content()}
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Popover.Content>
    </Popover.Portal>
</Popover.Root>
