import { attachProjectHierarchyTreeScrollPersist } from './projectHierarchyTreeScrollPersistWiring'

export function attachProjectHierarchyTreeUiStateScrollListeners (deps: {
  getTreeScrollHost: () => HTMLElement | null
  queuePersistScrollTopPx: (scrollTopPx: number) => void
}): () => void {
  return attachProjectHierarchyTreeScrollPersist({
    getTreeScrollHost: deps.getTreeScrollHost,
    queuePersistScrollTopPx: deps.queuePersistScrollTopPx
  })
}
