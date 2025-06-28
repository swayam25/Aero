import type { Component } from "svelte";

export interface CtxStore {
    isOpen: boolean;
    x: number;
    y: number;
    actions: CtxAction[];
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
    icon?: Component;
    type?: "normal" | "error" | "success" | "warning";
    disabled?: boolean;
    separator?: boolean; // Add separator after this item
    shortcut?: string | CtxShortcut; // Keyboard shortcut (string for display, object for matching)
    onclick: (context: CtxActionContext) => void | Promise<void>;
}

export interface CtxActionContext {
    closeMenu: () => void;
    // Context is passed through the action's onclick function
    [key: string]: any;
}
