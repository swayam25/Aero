<script lang="ts">
    import type { DragOptions } from "@neodrag/svelte";
    import { draggable } from "@neodrag/svelte";

    type DraggableProps = {
        items: any[];
        onReorder: (fromIndex: number, toIndex: number) => void;
        onDragStart?: (index: number) => void;
        onDragEnd?: (index: number) => void;
        onDrag?: (index: number, translateY: number) => void;
        dragOptions?: Partial<DragOptions>;
        class?: string;
        disabled?: boolean;
    };

    let {
        items,
        onReorder,
        onDragStart,
        onDragEnd,
        onDrag,
        dragOptions = {},
        class: className = "",
        disabled = false,
        children,
    }: DraggableProps & { children: any } = $props();

    let currentDragIndex = $state(0);
    let translateY = $state(0);
    let lastOffsetY = $state(0);
    let dragging = $state(false);

    const defaultOptions: DragOptions = {
        axis: "y",
        bounds: "parent",
        recomputeBounds: {
            drag: true,
        },
        onDragStart({ rootNode, offsetY }) {
            currentDragIndex = [...rootNode.parentNode!.children].indexOf(rootNode);
            lastOffsetY = offsetY;
            translateY = 0;
            dragging = true;
            onDragStart?.(currentDragIndex);
        },
        onDrag({ rootNode, offsetY }) {
            translateY += offsetY - lastOffsetY;
            lastOffsetY = offsetY;

            if (translateY > 0.5 * rootNode.clientHeight && currentDragIndex < items.length - 1) {
                shiftItem(rootNode, 1);
            } else if (translateY < -0.5 * rootNode.clientHeight && currentDragIndex > 0) {
                shiftItem(rootNode, -1);
            }

            onDrag?.(currentDragIndex, translateY);
        },
        onDragEnd({ rootNode }) {
            rootNode.style.transform = `translate3d(0,0,0)`;
            translateY = 0;
            dragging = false;
            onDragEnd?.(currentDragIndex);
        },
        transform() {
            return `translate3d(0,${translateY}px,0)`;
        },
    };

    // Merge user options with default options and apply disabled state
    const options: DragOptions = { ...defaultOptions, ...dragOptions, disabled };

    function shiftItem(item: HTMLElement, shift: number) {
        const newIndex = currentDragIndex + shift;

        // Call the reorder callback
        onReorder(currentDragIndex, newIndex);

        // Update internal state
        currentDragIndex = newIndex;
        translateY -= shift * item.offsetHeight;
    }

    // Export the dragging state so parent components can use it
    // This allows parent components to access dragging state for animations
    let isDragging = $derived(dragging);
    let dragIndex = $derived(currentDragIndex);
</script>

<div class={className} use:draggable={options}>
    {@render children({ isDragging, dragIndex })}
</div>
