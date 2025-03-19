<script lang="ts">
    import { Popover } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        trigger: Snippet;
        content: Snippet;
    }
    let { trigger, content }: Props = $props();
</script>

<Popover.Root>
    <Popover.Trigger>
        {@render trigger()}
    </Popover.Trigger>
    <Popover.Portal>
        <Popover.Content side="top" class="mb-2 rounded-lg border border-slate-700 bg-slate-900 p-1 text-sm" forceMount>
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
