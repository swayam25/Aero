import { get, writable } from "svelte/store";
import { matchesShortcut } from "./shortcuts";
import type { CtxAction, CtxActionContext, CtxStore, CtxSubmenuLoader } from "./types";

export const store = writable<CtxStore>({
    isOpen: false,
    x: 0,
    y: 0,
    actions: [],
    submenu: undefined,
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
        },
    }));

    store.set({
        isOpen: true,
        x,
        y,
        actions: enhancedActions,
        submenu: undefined,
    });
}

export function closeCtxMenu() {
    store.update((state) => ({
        ...state,
        isOpen: false,
        x: 0,
        y: 0,
        actions: [],
        submenu: undefined,
    }));
}

// Helper function to create context actions
export function createCtxAction(
    action: Omit<CtxAction, "id"> & {
        id?: string;
        onclick: (ctx: CtxActionContext) => void | Promise<void>;
    },
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
        },
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

// Submenu management functions
export function openSubmenu(parentIndex: number, submenuActions: CtxAction[], parentButtonRect: DOMRect) {
    store.update((state) => {
        // Calculate submenu position
        const submenuX = parentButtonRect.right + 8; // 8px gap from parent menu
        const submenuY = parentButtonRect.top;

        // Check if submenu would go off screen and adjust position
        const submenuWidth = 192; // min-w-48 = 192px
        const submenuHeight = submenuActions.length * 40; // approximate height per item

        let adjustedX = submenuX;
        let adjustedY = submenuY;

        // Adjust horizontal position if submenu goes off right edge
        if (submenuX + submenuWidth > window.innerWidth) {
            adjustedX = parentButtonRect.left - submenuWidth - 8; // Show on left side instead
        }

        // Adjust vertical position if submenu goes off bottom edge
        if (submenuY + submenuHeight > window.innerHeight - 72) {
            adjustedY = Math.max(window.innerHeight - submenuHeight - 72, 50);
        }

        return {
            ...state,
            submenu: {
                isOpen: true,
                x: adjustedX,
                y: adjustedY,
                actions: submenuActions,
                parentIndex,
            },
        };
    });
}

export function closeSubmenu() {
    store.update((state) => ({
        ...state,
        submenu: undefined,
    }));
}

// Dynamic submenu utilities
export function createSubmenuLoader(
    loader: () => Promise<CtxAction[]>,
    options: {
        loadingItems?: number;
        loadingLabel?: string;
        errorLabel?: string;
    } = {},
): CtxSubmenuLoader {
    return {
        loader,
        loadingItems: options.loadingItems ?? 3,
        loadingLabel: options.loadingLabel ?? "Loading...",
        errorLabel: options.errorLabel ?? "Failed to load",
    };
}

export function createLoadingActions(count: number, label: string): CtxAction[] {
    return Array.from({ length: count }, (_, i) =>
        createCtxAction({
            label: `${label} ${i + 1}`,
            type: "skeleton",
            disabled: true,
            onclick: async () => {},
        }),
    );
}

export function createErrorAction(label: string, icon?: any): CtxAction {
    return createCtxAction({
        label,
        icon,
        type: "error",
        disabled: true,
        onclick: async () => {},
    });
}

export function isSubmenuLoader(submenu: CtxAction[] | CtxSubmenuLoader | undefined): submenu is CtxSubmenuLoader {
    return submenu !== undefined && !Array.isArray(submenu) && "loader" in submenu;
}

export * from "./actions";
export { default as ContextMenu } from "./components/ContextMenu.svelte";
export { default as CtxButton } from "./components/CtxButton.svelte";
export * from "./playlist";
export * from "./shortcuts";
export type * from "./types";
