# Context Menu System

A unified, maintainable context menu system for Aero built with Svelte 5.

## Features

- 🎯 **Type-safe**: Full ts support
- ⌨️ **Keyboard shortcuts**: Built-in support for shortcuts defined in actions
- 🎨 **Themed**: Consistent with app design
- 🔧 **Extensible**: Easy to add custom actions
- 📱 **Responsive**: Works on desktop and mobile
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation
- 🚀 **Fast**: Action-based approach with no legacy type-specific logic

## Structure

```
/ctxmenu/
├── components/
│   ├── ContextMenu.svelte # Main context menu
│   ├── CtxButton.svelte   # Menu button component
│   └── Demo.svelte        # Demo component
├── types.ts               # Type definitions
├── index.ts               # Main exports & keyboard handling
├── shortcuts.ts           # Comprehensive shortcuts object & utilities
├── actions.ts             # Action factories
└── README.md              # This file
```

## Quick Start

```ts
import { openCtxMenu, createSongActions } from "$lib/ctxmenu";

// Use action factory with keyboard shortcuts automatically included
function handleSongContextMenu(e: MouseEvent, song: SongDetailed) {
    e.preventDefault();
    const actions = createSongActions(song, user?.id);
    openCtxMenu(e, actions);
}
```

## Action Factories

Pre-built action factories for common use cases:

- **`createSongActions()`** - For individual songs (play, add to queue, add to playlist, copy link, etc).
- **`createQueueActions()`** - For songs in player queue (play/pause, remove from queue).
- **`createPlaylistActions()`** - For playlist management (share, rename, delete).
- **`createPlaylistSongActions()`** - For songs within playlists (play, add to queue, remove from playlist).
- **`createPlaylistSelectionActions()`** - For multiple selected songs in a playlist (play, add to queue, remove from playlist).

## Custom Actions

```ts
import { createCtxAction, shortcuts } from "$lib/ctxmenu";

const customActions = [
    createCtxAction({
        label: "Custom Action",
        icon: SolarStarLinear,
        type: "success",
        shortcut: shortcuts.ctrl.x, // Use shortcut helper
        onclick: async (ctx) => {
            // Your logic here
            ctx.closeMenu();
        }
    })
];

// Use custom actions
openCtxMenu(e, customActions);
```

## Keyboard Shortcuts

The `shortcuts` helper provides common key combinations:

```ts
import { shortcuts } from "$lib/ctxmenu";

// Basic keys
shortcuts.space        // { key: " " }
shortcuts.enter        // { key: "Enter" }
shortcuts.delete       // { key: "Delete" }

// With modifiers
shortcuts.ctrl.c       // { key: "c", ctrlKey: true }
shortcuts.shift.delete // { key: "Delete", shiftKey: true }
shortcuts.alt.f4       // { key: "F4", altKey: true }
```

## API

### `openCtxMenu()`
```ts
openCtxMenu(e: MouseEvent, actions: CtxAction[])
```

### `formatShortcut()`
```ts
formatShortcut(shortcut: string | CtxShortcut): string
```
Formats a shortcut for display in the UI (e.g., `{key: "c", ctrlKey: true}` becomes `"Ctrl+C"`).

### `createCtxAction()`
```ts
createCtxAction(action: {
    label: string;
    icon?: Component;
    type?: "normal" | "error" | "success" | "warning";
    disabled?: boolean;
    separator?: boolean;
    shortcut?: CtxShortcut; // String or object format
    onclick: (ctx: CtxActionContext) => void | Promise<void>;
}): CtxAction
```

### Shortcut Helpers

The `shortcuts` object provides **comprehensive** key combinations for all possible keys:

```typescript
import { shortcuts } from "$lib/ctxmenu/shortcuts";

// Basic keys
shortcuts.space        // { key: " " }
shortcuts.enter        // { key: "Enter" }
shortcuts.delete       // { key: "Delete" }
shortcuts.f1           // { key: "F1" }
shortcuts.arrowUp      // { key: "ArrowUp" }

// All letter keys (a-z)
shortcuts.a            // { key: "a" }
shortcuts.b            // { key: "b" }
// ... all letters

// All number keys (0-9)
shortcuts[0]           // { key: "0" }
shortcuts[1]           // { key: "1" }
// ... all numbers

// With modifiers
shortcuts.ctrl.c       // { key: "c", ctrlKey: true }
shortcuts.shift.delete // { key: "Delete", shiftKey: true }
shortcuts.alt.f4       // { key: "F4", altKey: true }
shortcuts.meta.s       // { key: "s", metaKey: true }

// Multi-modifier combinations
shortcuts.ctrlShift.z  // { key: "z", ctrlKey: true, shiftKey: true }
shortcuts.ctrlAlt.t    // { key: "t", ctrlKey: true, altKey: true }
shortcuts.shiftAlt.a   // { key: "a", shiftKey: true, altKey: true }

// Symbol keys (with and without shift)
shortcuts.minus        // { key: "-" }
shortcuts.shift.minus  // { key: "_" } (Shift+-)
shortcuts.equal        // { key: "=" }
shortcuts.shift.equal  // { key: "+" } (Shift+=)

// Numpad keys
shortcuts.numpad0      // { key: "Numpad0" }
shortcuts.numpadAdd    // { key: "NumpadAdd" }
shortcuts.numpadEnter  // { key: "NumpadEnter" }
```

### Shortcut Utilities
```typescript
import { parseShortcut, matchesShortcut, formatShortcut } from "$lib/ctxmenu/shortcuts";

// Parse string shortcuts to objects
parseShortcut("Ctrl+C")  // { key: "c", ctrlKey: true }

// Check if keyboard event matches shortcut
matchesShortcut(event, shortcuts.ctrl.c)  // boolean

// Format shortcut for display
formatShortcut(shortcuts.ctrl.c)  // "Ctrl+C"
formatShortcut(shortcuts.space)   // "Space"
formatShortcut(shortcuts.arrowUp) // "↑"
```

### Action Factories
```ts
createSongActions(song: SongDetailed, loginUserID: string | null): CtxAction[]
createQueueActions(song: SongDetailed): CtxAction[]
createPlaylistActions(playlistData: { name: string; id: string }, loginUserID: string | null): CtxAction[]
createPlaylistSongActions(song: SongDetailed, playlistData: { name: string; id: string }, loginUserID: string | null, accessedUserID: string | null): CtxAction[]
```

## Development

To run type checks:
```bash
pnpm run check
```
