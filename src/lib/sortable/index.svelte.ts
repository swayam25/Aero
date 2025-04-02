import Sortable from "sortablejs";

export const useSortable = (getter: () => HTMLElement | null, options?: Sortable.Options) => {
    $effect(() => {
        const sortableEl = getter();
        const sortable = sortableEl ? Sortable.create(sortableEl, options) : null;
        return () => sortable?.destroy();
    });
};

export function reorder<T>(array: T[], event: Sortable.SortableEvent): T[] {
    const { oldIndex, newIndex } = event;

    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
        return array;
    }

    const [movedItem] = array.splice(oldIndex, 1);
    array.splice(newIndex, 0, movedItem);

    return array;
}
