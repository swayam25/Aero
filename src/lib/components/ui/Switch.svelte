<script lang="ts">
    import { cn } from "$lib/utils/cn";
    import { Switch } from "bits-ui";

    interface Props {
        size?: "sm" | "md" | "lg" | "xl" | "";
        checked?: boolean;
        disabled?: boolean;
        onCheckedChange?: (checked: boolean) => void;
    }
    let { size = "md", checked = $bindable(false), disabled, onCheckedChange }: Props = $props();

    let sizeClass: string = $derived.by(() => {
        switch (size) {
            case "sm":
                return "h-6 w-[40px]";
            case "md":
                return "h-8 w-[60px]";
            case "lg":
                return "h-10 w-[80px]";
            case "xl":
                return "h-12 w-[100px]";
            default:
                return "";
        }
    });

    let thumbSizeClass: string = $derived.by(() => {
        switch (size) {
            case "sm":
                return "size-5 data-[state=checked]:translate-x-[70%]";
            case "md":
                return "size-7 data-[state=checked]:translate-x-[90%]";
            case "lg":
                return "size-9 data-[state=checked]:translate-x-[100%]";
            case "xl":
                return "size-11 data-[state=checked]:translate-x-[110%]";
            default:
                return "";
        }
    });
</script>

<Switch.Root
    name="applicationStatus"
    bind:checked
    {disabled}
    {onCheckedChange}
    class={cn(
        "inline-flex cursor-pointer items-center gap-11 rounded-full bg-gray-800 p-1 transition-all disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-sky-500",
        sizeClass
    )}
>
    <Switch.Thumb
        class={cn(
            "pointer-events-none block shrink-0 rounded-full bg-gray-50 transition-all data-[state=unchecked]:translate-x-0",
            thumbSizeClass
        )}
    />
</Switch.Root>
