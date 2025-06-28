import type { Component } from "svelte";

export interface CtxStore {
    isOpen: boolean;
    x: number;
    y: number;
    actions: CtxAction[];
    submenu?: {
        isOpen: boolean;
        x: number;
        y: number;
        actions: CtxAction[];
        parentIndex: number;
    };
}

export interface CtxShortcut {
    key: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
}

export interface CtxAction {
    id: string;
    label: string;
    description?: string; // Optional description for mobile drawer
    icon?: Component;
    image?: string; // URL for thumbnail/avatar images
    type?: "normal" | "error" | "success" | "warning" | "skeleton" | "destructive";
    disabled?: boolean;
    separator?: boolean; // Add separator after this item
    shortcut?: string | CtxShortcut; // Keyboard shortcut (string for display, object for matching)
    submenu?: CtxAction[] | CtxSubmenuLoader; // Static submenu or dynamic loader
    onclick: (context: CtxActionContext) => void | Promise<void>;
}

// Dynamic submenu loader interface
export interface CtxSubmenuLoader {
    loader: () => Promise<CtxAction[]>;
    loadingItems?: number; // Number of skeleton items to show while loading (default: 3)
    loadingLabel?: string; // Label for loading items (default: "Loading...")
    errorLabel?: string; // Label for error state (default: "Failed to load")
}

export interface CtxActionContext {
    closeMenu: () => void;
    // Context is passed through the action's onclick function
    [key: string]: any;
}
