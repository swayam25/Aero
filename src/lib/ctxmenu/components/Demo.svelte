<script lang="ts">
    import { createCtxAction, openCtxMenu } from "$lib/ctxmenu";
    import type { CtxAction } from "$lib/ctxmenu/types";
    import { toast } from "svelte-sonner";
    import SolarHeartLinear from "~icons/solar/heart-linear";
    import SolarMusicNoteLinear from "~icons/solar/music-note-linear";
    import SolarStarLinear from "~icons/solar/star-linear";

    function createCustomActions(): CtxAction[] {
        return [
            createCtxAction({
                label: "Add to Favorites",
                icon: SolarHeartLinear,
                type: "success",
                onclick: async (ctx) => {
                    toast.success("Added to favorites!");
                    ctx.closeMenu();
                },
            }),
            createCtxAction({
                label: "Rate Song",
                icon: SolarStarLinear,
                onclick: async (ctx) => {
                    toast.info("Rating feature coming soon!");
                    ctx.closeMenu();
                },
            }),
            createCtxAction({
                label: "View Album",
                icon: SolarMusicNoteLinear,
                separator: true,
                onclick: async (ctx) => {
                    toast.info("Album view coming soon!");
                    ctx.closeMenu();
                },
            }),
            createCtxAction({
                label: "Dangerous Action",
                type: "error",
                disabled: true,
                onclick: async (ctx) => {
                    ctx.closeMenu();
                },
            }),
        ];
    }

    function handleCustomContextMenu(e: MouseEvent) {
        e.preventDefault();
        const customActions = createCustomActions();
        openCtxMenu(e, customActions);
    }
</script>

<div
    class="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 p-4 transition-colors hover:bg-slate-700"
    oncontextmenu={handleCustomContextMenu}
    role="button"
    tabindex="0"
>
    <h3 class="mb-2 text-lg font-semibold">Enhanced Context Menu Demo</h3>
    <p class="text-sm text-slate-400">Right-click this area to see the new simplified context menu system.</p>
    <p class="mt-2 text-xs text-slate-500">Much cleaner implementation - no more complex state management!</p>
</div>
