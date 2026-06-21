export function mergeFilteredDragOrderIntoFullList<T extends { id: string }> (
  fullList: T[],
  reorderedFilteredList: T[]
): T[] {
  const reorderedQueue = [...reorderedFilteredList]
  const filteredIdSet = new Set(reorderedFilteredList.map((item) => item.id))

  return fullList.map((item) => {
    if (!filteredIdSet.has(item.id)) {
      return item
    }

    const nextItem = reorderedQueue.shift()
    return nextItem ?? item
  })
}
