<script lang="ts">
    import { AlertDialog } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        title: string;
        open?: boolean;
        trigger: Snippet;
        description: Snippet;
        actions: Snippet;
    }
    let { title, open = $bindable(false), trigger, description, actions }: Props = $props();
</script>

<AlertDialog.Root bind:open>
    <AlertDialog.Trigger class="flex w-full items-center justify-center">
        {@render trigger()}
    </AlertDialog.Trigger>
    <AlertDialog.Portal>
        <AlertDialog.Overlay class="fixed inset-0 z-100 flex size-full items-center justify-center backdrop-blur-md" forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fade={{ duration: 100 }}>
                        <AlertDialog.Content class="flex max-w-[50%] flex-col gap-5 rounded-lg border border-slate-700 bg-slate-900 p-5 text-sm">
                            <div class="flex flex-col gap-2 text-left">
                                <AlertDialog.Title class="text-xl font-extrabold">{title}</AlertDialog.Title>
                                <AlertDialog.Description class="mt-2 text-slate-200">
                                    {@render description()}
                                </AlertDialog.Description>
                                <div
                                    class="flex items-center justify-between gap-5 *:w-full *:cursor-pointer *:rounded-lg *:bg-slate-800 *:px-3 *:py-2 *:transition-all *:duration-200 *:not-first:flex *:not-first:w-full *:not-first:items-center *:not-first:justify-center *:not-first:gap-2 *:not-disabled:hover:bg-slate-800/50 *:disabled:brightness-80"
                                >
                                    <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                                    {@render actions()}
                                </div>
                            </div>
                        </AlertDialog.Content>
                    </div>
                {/if}
            {/snippet}
        </AlertDialog.Overlay>
    </AlertDialog.Portal>
</AlertDialog.Root>
