# Context Menu System

A unified, maintainable context menu system for Aero built with Svelte 5, featuring dynamic submenus, loading states, playlist thumbnail support, and mobile-responsive design with drawer interface.

## Structure

```
/ctxmenu/
├── components/
│   ├── ContextMenu.svelte       # Main context menu with responsive logic
│   ├── MobileContextMenu.svelte # Mobile drawer interface
│   ├── Submenu.svelte           # Desktop submenu component
│   ├── CtxButton.svelte         # Menu button component
│   └── Demo.svelte              # Demo component
├── types.ts                     # Type definitions including dynamic submenu types
├── index.ts                     # Main exports, utilities & keyboard handling
├── shortcuts.ts                 # Comprehensive shortcuts object & utilities
├── actions.ts                   # Action factories with dynamic loading examples
└── README.md                    # This file
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

## Dynamic Submenus

The dynamic submenu system allows you to load content asynchronously when users interact with menu items.

### Basic Usage

```ts
import { createCtxAction, createSubmenuLoader } from "$lib/ctxmenu";

const actionWithDynamicSubmenu = createCtxAction({
    label: "Load Items",
    icon: SolarListLinear,
    submenu: createSubmenuLoader(
        // Loader function - returns Promise<CtxAction[]>
        async () => {
            const response = await fetch('/api/items');
            const items = await response.json();

            return items.map(item => createCtxAction({
                label: item.name,
                image: item.thumbnail, // Optional thumbnail
                description: item.info, // Optional description (shown in mobile)
                onclick: async (ctx) => {
                    console.log('Selected:', item);
                    ctx.closeMenu();
                }
            }));
        },
        // Configuration (optional)
        {
            loadingItems: 3,                   // Number of skeleton items (default: 3)
            loadingLabel: "Loading items",     // Loading text (default: "Loading...")
            errorLabel: "Failed to load items" // Error text (default: "Failed to load")
        }
    ),
    onclick: async (ctx) => {
        // Fallback if submenu is not used
        ctx.closeMenu();
    }
});
```

### Real Example - Playlist Submenu

The playlist submenu is implemented using the dynamic system:

```ts
// In createSongActions()
createCtxAction({
    label: "Add to Playlist",
    icon: SolarMusicLibraryLinear,
    submenu: createSubmenuLoader(
        () => loadPlaylistSubmenu(song),
        {
            loadingItems: 3,
            loadingLabel: "Loading playlist",
            errorLabel: "Failed to load playlists"
        }
    ),
    onclick: async (ctx) => ctx.closeMenu()
})
```

## Static Submenus

For static content that doesn't need to be loaded:

```ts
const actionWithStaticSubmenu = createCtxAction({
    label: "Static Menu",
    icon: SolarMenuLinear,
    submenu: [
        createCtxAction({
            label: "Option 1",
            onclick: async (ctx) => {
                console.log('Option 1 selected');
                ctx.closeMenu();
            }
        }),
        createCtxAction({
            label: "Option 2",
            onclick: async (ctx) => {
                console.log('Option 2 selected');
                ctx.closeMenu();
            }
        })
    ],
    onclick: async (ctx) => ctx.closeMenu()
});
```

## Custom Actions

```ts
import { createCtxAction, shortcuts } from "$lib/ctxmenu";

const customActions = [
    createCtxAction({
        label: "Custom Action",
        icon: SolarStarLinear,
        image: "https://example.com/thumbnail.jpg", // Optional thumbnail
        type: "success", // "normal" | "error" | "success" | "warning" | "skeleton"
        shortcut: shortcuts.ctrl.x, // Use shortcut helper
        separator: true, // Add separator after this item
        onclick: async (ctx) => {
            // Your logic here
            toast.success("Action executed!");
            ctx.closeMenu();
        }
    })
];

// Use custom actions
openCtxMenu(e, customActions);
```

## Action Types

Actions support different visual types:

```ts
createCtxAction({
    label: "Delete",
    type: "destructive", // Red highlight
    onclick: async (ctx) => {
        // Destructive action
        ctx.closeMenu();
    }
});

// Available types:
// - "normal" (default)
// - "error" / "destructive" (red)
// - "success" (green)
// - "warning" (yellow)
// - "skeleton" (loading state)
```

## Loading States

When using dynamic submenus, the system automatically shows skeleton loading animations:

```ts
// This will show 5 skeleton items while loading
createSubmenuLoader(
    async () => {
        // Your async loading logic
        return actions;
    },
    {
        loadingItems: 5,
        loadingLabel: "Loading data"
    }
)
```

## Error Handling

The system provides automatic error handling for failed dynamic loads:

```ts
// If the loader function throws an error,
// an error action will be shown automatically
createSubmenuLoader(
    async () => {
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error('Failed to fetch');
        }
        return await response.json();
    },
    {
        errorLabel: "Could not load data" // Custom error message
    }
)
```

## Image Support

Actions can display images (like playlist thumbnails):

```ts
createCtxAction({
    label: "My Playlist",
    image: "https://example.com/playlist-cover.jpg", // Image URL
    icon: SolarMusicLibraryLinear, // Fallback icon if image fails
    onclick: async (ctx) => {
        ctx.closeMenu();
    }
})
```

## Keyboard Shortcuts

The `shortcuts` helper provides common key combinations:

```ts
import { shortcuts } from "$lib/ctxmenu";

// Basic keys
shortcuts.space        // { key: " " }
shortcuts.enter        // { key: "Enter" }
shortcuts.delete       // { key: "Delete" }
shortcuts.escape       // { key: "Escape" }

// With modifiers
shortcuts.ctrl.c       // { key: "c", ctrlKey: true }
shortcuts.shift.delete // { key: "Delete", shiftKey: true }
shortcuts.alt.f4       // { key: "F4", altKey: true }
shortcuts.ctrl.shift.n // { key: "n", ctrlKey: true, shiftKey: true }

// Function keys
shortcuts.f2           // { key: "F2" }
shortcuts.f5           // { key: "F5" }
```

## Responsive Positioning

The context menu automatically adjusts its position to stay within the viewport:

- **Horizontal**: Shows on left if too close to right edge
- **Vertical**: Shows above if too close to bottom edge
- **Submenus**: Position relative to parent menu item with edge detection

## Utilities

### Core Functions

```ts
import {
    openCtxMenu,           // Open a context menu
    closeCtxMenu,          // Close the main menu
    createCtxAction,       // Create a menu action
    createSubmenuLoader,   // Create dynamic submenu loader
    createLoadingActions,  // Generate skeleton loading actions
    createErrorAction,     // Create error state action
    isSubmenuLoader        // Type guard for submenu detection
} from "$lib/ctxmenu";
```

### Development

```bash
# Using pnpm (required)
pnpm install           # Install dependencies
pnpm run check         # TypeScript validation
pnpm run dev           # Development server
```

## Examples

### User Profile Menu
```ts
const userMenuActions = [
    createCtxAction({
        label: "Recent Files",
        icon: SolarDocumentLinear,
        submenu: createSubmenuLoader(
            async () => {
                const files = await fetchRecentFiles();
                return files.map(file => createCtxAction({
                    label: file.name,
                    image: file.thumbnail,
                    onclick: async (ctx) => {
                        openFile(file.id);
                        ctx.closeMenu();
                    }
                }));
            }
        )
    })
];
```

### Search Results Menu
```ts
const searchMenuActions = [
    createCtxAction({
        label: "Search Results",
        icon: SolarSearchLinear,
        submenu: createSubmenuLoader(
            async () => {
                const results = await searchAPI(query);
                return results.map(result => createCtxAction({
                    label: result.title,
                    onclick: async (ctx) => {
                        navigateToResult(result);
                        ctx.closeMenu();
                    }
                }));
            },
            {
                loadingItems: 5,
                loadingLabel: "Searching",
                errorLabel: "Search failed"
            }
        )
    })
];
```

## Mobile-Specific Considerations

### Action Descriptions
On mobile, actions can include descriptions for better UX:

```ts
createCtxAction({
    label: "Share",
    description: "Share this song with friends", // Shown below label on mobile
    icon: SolarShareLinear,
    onclick: async (ctx) => {
        shareAction();
        ctx.closeMenu();
    }
});
```

### Touch Optimization
The mobile drawer automatically optimizes for touch:
- Larger touch targets (48px minimum)
- Smooth drawer animations
- Gesture-friendly close handles
- Proper spacing between items

### Navigation Stack
Mobile submenus use a navigation stack:
- **Back button**: Returns to previous menu level
- **Title**: Shows current submenu name
- **Breadcrumb**: Visual indicator of depth

### Performance
The mobile drawer is optimized for performance:
- Lazy loading of submenu content
- Efficient rendering with virtual scrolling for large lists
- Minimal DOM updates during navigation

## Dependencies

- **vaul-svelte**: Mobile drawer component
- **svelte-sonner**: Toast notifications for error handling
- **@iconify/svelte**: Icon system

## Installation

```bash
pnpm add vaul-svelte svelte-sonner
```

## Best Practices

1. **Keep menus shallow**: Avoid deep nesting (max 2-3 levels)
2. **Use loading states**: Always provide feedback during async operations
3. **Provide descriptions**: Use descriptions on mobile for better UX
4. **Handle errors gracefully**: Always include error labels for dynamic content
5. **Test on mobile**: Verify drawer behavior on actual mobile devices
6. **Optimize images**: Use appropriate sizes for thumbnails
7. **Consider accessibility**: Ensure proper ARIA labels and keyboard navigation
