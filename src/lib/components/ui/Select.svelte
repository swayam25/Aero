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
        size?: "xs" | "sm" | "md" | "lg";
        onValueChange?: (value: string) => void;
    }

    let {
        value = $bindable(""),
        items,
        placeholder = "Select an option",
        disabled = false,
        class: className,
        size = "md",
        onValueChange,
    }: Props = $props();
    let open = $state(false);
    let selectFocus = $state(false);

    const selectedItem = $derived(items.find((item) => item.value === value));
    const selectedLabel = $derived(() => {
        return selectedItem ? selectedItem.label : placeholder;
    });

    const isPlaceholder = $derived(!value || !selectedItem);

    const sizeClasses = $derived.by(() => {
        switch (size) {
            case "xs":
                return {
                    trigger: "h-7 px-1.5 py-0.5 text-xs gap-2",
                    icon: "size-4",
                    arrow: "size-4",
                    item: "h-7 p-1.5 text-xs gap-1.5",
                    itemIcon: "size-4",
                };
            case "sm":
                return {
                    trigger: "h-8 px-2 py-1 text-sm gap-3",
                    icon: "size-5",
                    arrow: "size-4",
                    item: "h-8 p-2 text-sm gap-2",
                    itemIcon: "size-4",
                };
            case "md":
                return {
                    trigger: "h-10 px-3 py-1.5 text-base gap-4",
                    icon: "size-6",
                    arrow: "size-5",
                    item: "h-10 p-2 text-base gap-2",
                    itemIcon: "size-5",
                };
            case "lg":
                return {
                    trigger: "h-12 px-4 py-2 text-lg gap-4",
                    icon: "size-7",
                    arrow: "size-6",
                    item: "h-12 p-3 text-lg gap-3",
                    itemIcon: "size-6",
                };
        }
    });

    function handleValueChange(newValue: string) {
        value = newValue;
        onValueChange?.(newValue);
    }
</script>

<Select.Root bind:value bind:open onValueChange={handleValueChange} {disabled} type="single">
    <Select.Trigger
        class={cn(
            "flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 text-slate-50 transition-colors duration-200 focus:outline-none",
            sizeClasses.trigger,
            (selectFocus || open) && "border-slate-400!",
            disabled && "cursor-not-allowed brightness-80",
            className,
        )}
        {disabled}
        onfocusin={() => (selectFocus = true)}
        onfocusout={() => (selectFocus = false)}
    >
        <div class="flex items-center justify-center gap-2">
            {#if selectedItem?.icon}
                <selectedItem.icon class={cn(sizeClasses.icon, "text-slate-400")} />
            {/if}
            <span class={cn("truncate text-slate-200", isPlaceholder && "text-slate-400")}>
                {selectedLabel()}
            </span>
        </div>
        <div class="flex items-center">
            <SolarAltArrowDownLinear class={cn(sizeClasses.arrow, "text-slate-400 transition-transform duration-200", open && "rotate-180")} />
        </div>
    </Select.Trigger>

    <Select.Portal>
        <Select.Content
            sideOffset={5}
            class="z-200 min-w-(--bits-select-anchor-width) overflow-hidden rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl outline-hidden select-none"
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
                            "flex w-full cursor-pointer items-center rounded-lg text-slate-50 outline-hidden transition-colors duration-200 select-none hover:bg-slate-800 focus:bg-slate-800 focus:outline-none",
                            sizeClasses.item,
                            item.disabled && "cursor-not-allowed opacity-80 hover:bg-slate-900",
                            "data-highlighted:bg-slate-800 data-selected:bg-slate-800",
                        )}
                    >
                        {#snippet children({ selected })}
                            {#if item.icon}
                                <item.icon class={cn(sizeClasses.itemIcon, "text-slate-400")} />
                            {/if}
                            <span class="flex-1 truncate">{item.label}</span>
                            {#if selected}
                                <div class="ml-auto flex items-center">
                                    <SolarUnreadLinear class={sizeClasses.itemIcon} />
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
