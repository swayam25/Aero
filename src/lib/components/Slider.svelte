<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { Slider } from "bits-ui";

    interface Props {
        min?: number;
        max?: number;
        value: number;
        class: string;
    }
    let { min = 0, max = 100, value, class: className }: Props = $props();
</script>

<div class={cn("group p-1", className)}>
    <Slider.Root type="single" {value} {min} {max} class="relative flex w-full touch-none items-center select-none">
        <span class="relative h-1 w-full grow cursor-pointer overflow-hidden rounded-full bg-slate-800">
            <Slider.Range class="absolute h-full bg-slate-200 transition-colors duration-200 group-hover:bg-sky-500" />
        </span>
        <Slider.Thumb index={0} class="size-3 rounded-full bg-slate-200 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </Slider.Root>
</div>
