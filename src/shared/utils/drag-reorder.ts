/**
 * Reorders an array using drag-and-drop indices
 *
 * @param array - The array to reorder
 * @param fromIndex - The index of the item being dragged
 * @param toIndex - The index where the item is dropped
 * @returns A new array with the item moved from fromIndex to toIndex
 *
 * @example
 * const items = ['a', 'b', 'c', 'd'];
 * reorder(items, 0, 2); // ['b', 'c', 'a', 'd']
 */
export function reorder<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Reorders an array based on a drop target and relative position
 * Useful for HTML5 drag-and-drop where you need to determine insertion position
 *
 * @param array - The array to reorder
 * @param draggedId - The ID of the item being dragged
 * @param targetId - The ID of the drop target
 * @param getId - Function to extract ID from array items
 * @param position - 'before' or 'after' the target
 * @returns A new array with items reordered
 */
export function reorderById<T>(
  array: T[],
  draggedId: string,
  targetId: string,
  getId: (item: T) => string,
  position: 'before' | 'after' = 'after'
): T[] {
  const draggedIndex = array.findIndex((item) => getId(item) === draggedId);
  const targetIndex = array.findIndex((item) => getId(item) === targetId);

  if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
    return array;
  }

  const result = [...array];
  const [removed] = result.splice(draggedIndex, 1);

  // Adjust target index if dragging from before target
  const adjustedTargetIndex =
    draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;

  const insertIndex = position === 'before' ? adjustedTargetIndex : adjustedTargetIndex + 1;
  result.splice(insertIndex, 0, removed);

  return result;
}
