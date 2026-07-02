import { resolveProjectHierarchyTreeScrollContainer } from '../functions/projectHierarchyTreeScrollContainer'

export function attachProjectHierarchyTreeScrollPersist (deps: {
  getTreeScrollHost: () => HTMLElement | null
  queuePersistScrollTopPx: (scrollTopPx: number) => void
}): () => void {
  const scrollContainer = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
  if (scrollContainer === null) {
    return () => undefined
  }
  const onScroll = (): void => {
    deps.queuePersistScrollTopPx(scrollContainer.scrollTop)
  }
  scrollContainer.addEventListener('scroll', onScroll, {
    passive: true
  })
  return () => {
    scrollContainer.removeEventListener('scroll', onScroll)
  }
}
