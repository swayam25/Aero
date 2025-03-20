<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { formatTime } from "$lib/utils/time";
    import RangeSlider from "svelte-range-slider-pips";

    interface Props {
        value: number;
        min?: number;
        max?: number;
        step?: number;
        class?: string;
        disabled?: boolean;
        onChange?: (value: number) => void;
    }
    let { value = $bindable(), min = 0, max = 100, step = 1, class: className, disabled = false, onChange = () => {} }: Props = $props();
</script>

<div class={cn("group", className)}>
    <RangeSlider
        bind:value
        springValues={{ stiffness: 0.17, damping: 1 }}
        {min}
        {max}
        {step}
        formatter={(value) => {
            return formatTime(value);
        }}
        range="min"
        {disabled}
        on:change={(e) => onChange(e.detail.values[0])}
    />
</div>
