<script lang="ts">
    type DraggableProps = {
        onReorder: (fromIndex: number, toIndex: number) => void;
        onDragStart?: (index: number) => void;
        onDragEnd?: (index: number) => void;
        onDrag?: (index: number) => void;
        class?: string;
        disabled?: boolean;
    };

    let {
        onReorder,
        onDragStart,
        onDragEnd,
        onDrag,
        class: className = "",
        disabled = false,
        children,
    }: DraggableProps & { children: any } = $props();

    let dragging = $state(false);
    let currentDragIndex = $state(-1);
    let dragOverIndex = $state(-1);

    let touchStartY = $state(0);
    let touchCurrentY = $state(0);
    let touchTimeout: number | null = null;
    let isTouchDragging = $state(false);

    function handleDragStart(e: DragEvent, index: number) {
        if (disabled) return;
        dragging = true;
        currentDragIndex = index;
        onDragStart?.(index);
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/html", (e.target as HTMLElement).innerHTML);
        }
    }

    function handleDragOver(e: DragEvent, index: number) {
        if (disabled) return;
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = "move";
        }
        dragOverIndex = index;
        onDrag?.(index);
    }

    function handleDragEnter(e: DragEvent, index: number) {
        if (disabled) return;
        e.preventDefault();
        dragOverIndex = index;
    }

    function handleDragLeave(e: DragEvent) {
        if (disabled) return;
        dragOverIndex = -1;
    }

    function handleDrop(e: DragEvent, dropIndex: number) {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        if (currentDragIndex !== dropIndex && currentDragIndex !== -1) {
            onReorder(currentDragIndex, dropIndex);
        }
        dragging = false;
        dragOverIndex = -1;
        const endIndex = dropIndex;
        currentDragIndex = -1;
        onDragEnd?.(endIndex);
    }

    function handleDragEnd(e: DragEvent) {
        if (disabled) return;
        dragging = false;
        dragOverIndex = -1;
        const endIndex = currentDragIndex;
        currentDragIndex = -1;
        if (endIndex !== -1) {
            onDragEnd?.(endIndex);
        }
    }

    function handleTouchStart(e: TouchEvent, index: number) {
        if (disabled) return;
        const touch = e.touches[0];
        touchStartY = touch.clientY;
        touchCurrentY = touch.clientY;
        // Start a timeout to initiate drag after 500ms of holding
        touchTimeout = window.setTimeout(() => {
            isTouchDragging = true;
            dragging = true;
            currentDragIndex = index;
            onDragStart?.(index);

            // Prevent context menu
            if (e.cancelable) {
                e.preventDefault();
            }
        }, 500);
    }

    function handleTouchMove(e: TouchEvent, containerElement: HTMLElement) {
        if (disabled || !isTouchDragging) {
            if (touchTimeout && !isTouchDragging) {
                clearTimeout(touchTimeout);
                touchTimeout = null;
            }
            return;
        }
        e.preventDefault(); // Prevent scrolling while dragging
        const touch = e.touches[0];
        touchCurrentY = touch.clientY;
        const elements = Array.from(containerElement.children);
        let overIndex = -1;
        for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect();
            if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                overIndex = i;
                break;
            }
        }
        if (overIndex !== -1) {
            dragOverIndex = overIndex;
            onDrag?.(overIndex);
        }
    }

    function handleTouchEnd(e: TouchEvent) {
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
        }
        if (disabled || !isTouchDragging) return;

        if (currentDragIndex !== dragOverIndex && dragOverIndex !== -1 && currentDragIndex !== -1) {
            onReorder(currentDragIndex, dragOverIndex);
        }
        const endIndex = dragOverIndex !== -1 ? dragOverIndex : currentDragIndex;
        isTouchDragging = false;
        dragging = false;
        dragOverIndex = -1;
        currentDragIndex = -1;
        if (endIndex !== -1) {
            onDragEnd?.(endIndex);
        }
    }

    let isDragging = $derived(dragging);
    let dragIndex = $derived(currentDragIndex);
    let containerElement: HTMLElement;
</script>

<div
    bind:this={containerElement}
    class={className}
    ontouchmove={(e) => containerElement && handleTouchMove(e, containerElement)}
    style="touch-action: {dragging ? 'none' : 'auto'};"
>
    {@render children({
        isDragging,
        dragIndex,
        handleDragStart,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        handleTouchStart,
        handleTouchEnd,
        dragOverIndex,
    })}
</div>

<style>
    div {
        -webkit-user-select: none;
        user-select: none;
    }
</style>
