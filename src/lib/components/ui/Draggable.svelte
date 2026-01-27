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

    let isDragging = $derived(dragging);
    let dragIndex = $derived(currentDragIndex);
    let containerElement: HTMLElement;
</script>

<div bind:this={containerElement} class={className}>
    {@render children({
        isDragging,
        dragIndex,
        handleDragStart,
        handleDragOver,
        handleDragEnter,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        dragOverIndex,
    })}
</div>

<style>
    div {
        -webkit-user-select: none;
        user-select: none;
    }
</style>
