<script lang="ts">
    import { Tooltip } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fly } from "svelte/transition";

    interface Props {
        side?: "top" | "right" | "bottom" | "left" | undefined;
        trigger: Snippet;
        content: Snippet;
    }
    let { side = undefined, trigger, content }: Props = $props();
</script>

<Tooltip.Provider>
    <Tooltip.Root delayDuration={100}>
        <Tooltip.Trigger>
            {@render trigger()}
        </Tooltip.Trigger>
        <Tooltip.Content
            {side}
            sideOffset={8}
            class="z-50 cursor-default rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm text-slate-200"
            forceMount
        >
            {#snippet child({ wrapperProps, props, open })}
                {#if open}
                    <div {...wrapperProps}>
                        <div {...props} transition:fly={{ duration: 100 }}>
                            {@render content()}
                            <Tooltip.Arrow class="rounded-lg text-slate-700" />
                        </div>
                    </div>
                {/if}
            {/snippet}
        </Tooltip.Content>
    </Tooltip.Root>
</Tooltip.Provider>
