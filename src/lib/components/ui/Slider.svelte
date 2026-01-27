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
        onStart?: (value: number) => void;
        onChange?: (value: number) => void;
        onStop?: (value: number) => void;
    }
    let {
        value = $bindable(),
        min = 0,
        max = 100,
        step = 1,
        class: className,
        disabled = false,
        onStart = () => {},
        onChange = () => {},
        onStop = () => {},
    }: Props = $props();
</script>

<div class={cn("group", className)} style="touch-action: none;">
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
        on:start={(e) => onStart(e.detail.values[0])}
        on:change={(e) => onChange(e.detail.values[0])}
        on:stop={(e) => onStop(e.detail.values[0])}
    />
</div>
