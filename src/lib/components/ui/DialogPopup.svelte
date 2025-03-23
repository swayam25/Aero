<script lang="ts">
    import { Dialog } from "bits-ui";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";
    import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";

    interface Props {
        title: string;
        open?: boolean;
        trigger: Snippet;
        description: Snippet;
        fields: Snippet;
        actions: Snippet;
    }
    let { title, open = $bindable(false), trigger, description, fields, actions }: Props = $props();
</script>

<Dialog.Root bind:open>
    <Dialog.Trigger class="flex w-full items-center justify-center">
        {@render trigger()}
    </Dialog.Trigger>
    <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-100 flex size-full items-center justify-center backdrop-blur-md" forceMount>
            {#snippet child({ props, open })}
                {#if open}
                    <div {...props} transition:fade={{ duration: 100 }}>
                        <Dialog.Content class="flex max-w-[90%] md:max-w-[50%] flex-col gap-5 rounded-lg border border-slate-700 bg-slate-900 p-5 text-sm">
                            <div class="flex flex-col gap-2 text-left">
                                <div class="flex items-center justify-between gap-2">
                                    <Dialog.Title class="text-xl font-extrabold">{title}</Dialog.Title>
                                    <Dialog.Close class="cursor-pointer transition-all duration-200 hover:brightness-80">
                                        <MaterialSymbolsCloseRounded class="size-6" />
                                    </Dialog.Close>
                                </div>
                                <Dialog.Description class="mt-2 text-slate-200">
                                    {@render description()}
                                </Dialog.Description>
                                <div class="flex items-center justify-center gap-2">
                                    {@render fields()}
                                </div>
                                <div
                                    class="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-5 *:flex *:w-full *:cursor-pointer *:items-center *:justify-center *:gap-2 *:rounded-lg *:bg-slate-800 *:px-3 *:py-2 *:transition-all *:duration-200 *:not-disabled:hover:bg-slate-800/50 *:disabled:brightness-80"
                                >
                                    {@render actions()}
                                </div>
                            </div>
                        </Dialog.Content>
                    </div>
                {/if}
            {/snippet}
        </Dialog.Overlay>
    </Dialog.Portal>
</Dialog.Root>
