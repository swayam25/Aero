import { get, writable } from "svelte/store";
import { matchesShortcut } from "./shortcuts";
import type { CtxAction, CtxActionContext, CtxStore } from "./types";

export const store = writable<CtxStore>({
    isOpen: false,
    x: 0,
    y: 0,
    actions: []
});

export function openCtxMenu(e: MouseEvent, actions: CtxAction[]) {
    const x = e.clientX;
    const y = e.clientY;

    // Enhance actions to automatically include closeMenu in context
    const enhancedActions = actions.map((action) => ({
        ...action,
        onclick: async (ctx: Partial<CtxActionContext> = {}) => {
            // Always provide closeMenu in context
            const enhancedCtx: CtxActionContext = { closeMenu: closeCtxMenu, ...ctx };
            return action.onclick(enhancedCtx);
        }
    }));

    store.set({
        isOpen: true,
        x,
        y,
        actions: enhancedActions
    });
}

export function closeCtxMenu() {
    store.update((state) => ({
        ...state,
        isOpen: false,
        x: 0,
        y: 0,
        actions: []
    }));
}

// Helper function to create context actions
export function createCtxAction(
    action: Omit<CtxAction, "id"> & {
        id?: string;
        onclick: (ctx: CtxActionContext) => void | Promise<void>;
    }
): CtxAction {
    return {
        id: action.id || crypto.randomUUID(),
        type: "normal",
        disabled: false,
        separator: false,
        ...action,
        onclick: async (ctx: CtxActionContext) => {
            // Context already includes closeMenu from openCtxMenu
            return action.onclick(ctx);
        }
    };
}

// Keyboard shortcut handler
async function handleKeyDown(e: KeyboardEvent) {
    const currentStore = get(store);
    if (!currentStore.isOpen) return;

    // Handle Escape key (always closes menu)
    if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeCtxMenu();
        return;
    }

    // Find matching shortcut from current actions
    for (const action of currentStore.actions) {
        if (action.shortcut && !action.disabled && matchesShortcut(e, action.shortcut)) {
            e.preventDefault();
            e.stopPropagation();
            const context: CtxActionContext = { closeMenu: closeCtxMenu };
            await action.onclick(context);
            return;
        }
    }
}

// Setup keyboard shortcuts
export function setupShortcuts(): () => void {
    document.addEventListener("keydown", handleKeyDown);

    // Return cleanup function
    return () => {
        document.removeEventListener("keydown", handleKeyDown);
    };
}

export * from "./actions";
export { default as ContextMenu } from "./components/ContextMenu.svelte";
export { default as CtxButton } from "./components/CtxButton.svelte";
export * from "./shortcuts";
export type * from "./types";
