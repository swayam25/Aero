<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { Select } from "bits-ui";
    import type { Component } from "svelte";
    import SolarAltArrowDownLinear from "~icons/solar/alt-arrow-down-linear";
    import SolarUnreadLinear from "~icons/solar/unread-linear";

    interface SelectItem {
        value: string;
        label: string;
        icon?: Component;
        disabled?: boolean;
    }

    interface Props {
        value?: string;
        items: SelectItem[];
        placeholder?: string;
        disabled?: boolean;
        class?: string;
        onValueChange?: (value: string) => void;
    }

    let { value = $bindable(""), items, placeholder = "Select an option", disabled = false, class: className, onValueChange }: Props = $props();

    let open = $state(false);
    let selectFocus = $state(false);

    const selectedItem = $derived(items.find((item) => item.value === value));
    const selectedLabel = $derived(() => {
        return selectedItem ? selectedItem.label : placeholder;
    });

    const isPlaceholder = $derived(!value || !selectedItem);

    function handleValueChange(newValue: string) {
        value = newValue;
        onValueChange?.(newValue);
    }
</script>

<Select.Root bind:value bind:open onValueChange={handleValueChange} {disabled} type="single">
    <Select.Trigger
        class={cn(
            "flex h-10 w-full items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-50 transition-colors duration-200 focus:outline-none",
            (selectFocus || open) && "!border-slate-400",
            disabled && "cursor-not-allowed brightness-80",
            className,
        )}
        {disabled}
        onfocusin={() => (selectFocus = true)}
        onfocusout={() => (selectFocus = false)}
    >
        <div class="flex items-center justify-center gap-4">
            {#if selectedItem?.icon}
                <selectedItem.icon class="size-6 text-slate-400" />
            {/if}
            <span class={cn("truncate text-slate-200", isPlaceholder && "text-slate-400")}>
                {selectedLabel()}
            </span>
        </div>
        <div class="flex items-center">
            <SolarAltArrowDownLinear class={cn("size-5 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
        </div>
    </Select.Trigger>

    <Select.Portal>
        <Select.Content
            sideOffset={5}
            class="z-200 min-w-[var(--bits-select-anchor-width)] overflow-hidden rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl outline-hidden select-none"
        >
            <Select.ScrollUpButton
                class="flex h-6 items-center justify-center bg-slate-900 text-slate-400 transition-colors duration-200 hover:bg-slate-800"
            >
                <SolarAltArrowDownLinear class="size-3 rotate-180" />
            </Select.ScrollUpButton>

            <Select.Viewport class="flex max-h-60 flex-col items-center justify-center gap-2 overflow-y-auto">
                {#each items as item (item.value)}
                    <Select.Item
                        value={item.value}
                        label={item.label}
                        disabled={item.disabled}
                        class={cn(
                            "flex h-10 w-full cursor-pointer items-center gap-2 rounded-lg p-2 text-sm text-slate-50 outline-hidden transition-colors duration-200 select-none hover:bg-slate-800 focus:bg-slate-800 focus:outline-none",
                            item.disabled && "cursor-not-allowed opacity-80 hover:bg-slate-900",
                            "data-[highlighted]:bg-slate-800 data-[selected]:bg-slate-800",
                        )}
                    >
                        {#snippet children({ selected })}
                            {#if item.icon}
                                <item.icon class="size-5 text-slate-400" />
                            {/if}
                            <span class="flex-1 truncate">{item.label}</span>
                            {#if selected}
                                <div class="ml-auto flex items-center">
                                    <SolarUnreadLinear class="size-5" />
                                </div>
                            {/if}
                        {/snippet}
                    </Select.Item>
                {/each}
            </Select.Viewport>

            <Select.ScrollDownButton
                class="flex h-6 items-center justify-center bg-slate-900 text-slate-400 transition-colors duration-200 hover:bg-slate-800"
            >
                <SolarAltArrowDownLinear class="size-3" />
            </Select.ScrollDownButton>
        </Select.Content>
    </Select.Portal>
</Select.Root>
