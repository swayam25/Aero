# Context Menu System

A unified, maintainable context menu system for Aero built with Svelte 5.

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
