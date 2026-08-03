import { resolveProjectHierarchyTreeScrollContainer } from '../functions/projectHierarchyTreeScrollContainer'
import {
  clampProjectHierarchyTreeScrollTopToLastDomRow,
  shouldClampProjectHierarchyTreeVirtualScrollTail
} from '../functions/projectHierarchyTreeVirtualScrollClamp'
import { requestProjectHierarchyTreeVirtualListUpdate } from '../functions/projectHierarchyTreeVirtualListUpdate'
import { isProjectHierarchyTreeScrollPreserveActive } from './projectHierarchyTreeScrollPreserveWiring'
import type { I_faProjectHierarchyTreeHeTreeInstance } from 'app/types/I_faProjectHierarchyTreeDomain'

export function attachProjectHierarchyTreeUiStateScrollListeners (deps: {
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  requestAnimationFrame?: (callback: () => void) => number
  shouldSkipPersistScrollTopPx?: (scrollTopPx: number) => boolean
}): () => void {
  return attachProjectHierarchyTreeScrollPersist({
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    queuePersistScrollTopPx: deps.queuePersistScrollTopPx,
    ...(deps.requestAnimationFrame === undefined
      ? {}
      : { requestAnimationFrame: deps.requestAnimationFrame }),
    ...(deps.shouldSkipPersistScrollTopPx === undefined
      ? {}
      : { shouldSkipPersistScrollTopPx: deps.shouldSkipPersistScrollTopPx })
  })
}

function flushProjectHierarchyTreeScrollPersistFrame (deps: {
  getTreeRef?: () => I_faProjectHierarchyTreeHeTreeInstance | null
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  scrollContainer: HTMLElement
  shouldSkipPersistScrollTopPx?: (scrollTopPx: number) => boolean
}): void {
  if (isProjectHierarchyTreeScrollPreserveActive()) {
    return
  }
  if (deps.getTreeRef !== undefined) {
    requestProjectHierarchyTreeVirtualListUpdate(deps.getTreeRef())
  }
  if (shouldClampProjectHierarchyTreeVirtualScrollTail(deps.scrollContainer)) {
    clampProjectHierarchyTreeScrollTopToLastDomRow(deps.scrollContainer)
  }
  const scrollTopPx = deps.scrollContainer.scrollTop
  if (deps.shouldSkipPersistScrollTopPx?.(scrollTopPx) === true) {
    return
  }
  deps.queuePersistScrollTopPx(scrollTopPx)
}

export function attachProjectHierarchyTreeScrollPersist (deps: {
  getTreeRef?: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  queuePersistScrollTopPx: (scrollTopPx: number) => void
  requestAnimationFrame?: (callback: () => void) => number
  shouldSkipPersistScrollTopPx?: (scrollTopPx: number) => boolean
}): () => void {
  const scrollContainer = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
  if (scrollContainer === null) {
    return () => undefined
  }
  const scheduleFrame = deps.requestAnimationFrame ?? requestAnimationFrame
  let pendingScrollFrame: number | null = null
  const flushScrollFrame = (): void => {
    pendingScrollFrame = null
    flushProjectHierarchyTreeScrollPersistFrame({
      scrollContainer,
      queuePersistScrollTopPx: deps.queuePersistScrollTopPx,
      ...(deps.getTreeRef === undefined ? {} : { getTreeRef: deps.getTreeRef }),
      ...(deps.shouldSkipPersistScrollTopPx === undefined
        ? {}
        : { shouldSkipPersistScrollTopPx: deps.shouldSkipPersistScrollTopPx })
    })
  }
  const onScroll = (): void => {
    if (pendingScrollFrame !== null) {
      return
    }
    pendingScrollFrame = scheduleFrame(flushScrollFrame)
  }
  scrollContainer.addEventListener('scroll', onScroll, {
    passive: true
  })
  return () => {
    scrollContainer.removeEventListener('scroll', onScroll)
    if (pendingScrollFrame !== null) {
      cancelAnimationFrame(pendingScrollFrame)
    }
    pendingScrollFrame = null
  }
}
