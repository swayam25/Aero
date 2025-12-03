<script lang="ts">
    import type { UserData } from "$lib/discord/types";
    import { cn } from "$lib/utils/cn";

    interface Props {
        user: UserData | null;
        class?: string;
        size?: "xs" | "sm" | "md" | "lg" | "xl" | "";
        animateOnHover?: boolean;
        animateAvatar?: boolean;
    }
    let { user, class: className, size = "lg", animateOnHover = true, animateAvatar = false }: Props = $props();

    let sizeClass = $derived.by(() => {
        switch (size) {
            case "xs":
                return "size-4 md:size-6";
            case "sm":
                return "size-6 md:size-8";
            case "md":
                return "size-8 md:size-10";
            case "lg":
                return "size-10 md:size-12";
            case "xl":
                return "size-12 md:size-16";
            default:
                return "";
        }
    });
</script>

<div
    role="img"
    class={cn("relative flex cursor-pointer items-center justify-center", sizeClass, className)}
    onmouseenter={() => {
        if (animateOnHover) animateAvatar = true;
    }}
    onmouseleave={() => {
        if (animateOnHover) animateAvatar = false;
    }}
>
    <img
        src="{user?.url?.avatar}{animateAvatar ? '' : '.webp'}"
        alt="{user?.global_name || user?.username}'s' Avatar"
        class="size-full rounded-full"
    />
    {#if user?.avatar_decoration_data?.asset}
        <img src="{user.url?.avatarDecoration}{animateAvatar ? '' : '.webp'}" alt="Avatar Decoration" class="absolute size-full rounded-full" />
    {/if}
</div>
