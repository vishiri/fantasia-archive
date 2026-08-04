import { resolveProjectHierarchyTreeScrollContainer } from '../functions/projectHierarchyTreeScrollContainer'
import {
  readProjectHierarchyTreeScrollTopPx,
  writeProjectHierarchyTreeScrollTopPx
} from '../functions/projectHierarchyTreeScrollPreserve'
import { resolveProjectHierarchyTreePreservedScrollTopPx } from '../functions/projectHierarchyTreeScrollPreserveResolve'
import { PROJECT_HIERARCHY_TREE_SCROLL_PRESERVE_SETTLE_FRAMES } from '../functions/projectHierarchyTreeConstants'
import { requestProjectHierarchyTreeVirtualListUpdate } from '../functions/projectHierarchyTreeVirtualListUpdate'
import type { I_faProjectHierarchyTreeHeTreeInstance } from 'app/types/I_faProjectHierarchyTreeDomain'

let projectHierarchyTreeScrollPreserveDepth = 0
let projectHierarchyTreeScrollPreserveTouch: (() => void) | null = null

/**
 * True while an outer scroll-preserve session is active (expand/drag/restore).
 */
export function isProjectHierarchyTreeScrollPreserveActive (): boolean {
  return projectHierarchyTreeScrollPreserveDepth > 0
}

/**
 * Clears module scroll-preserve session state between Vitest cases (nested depth can leak under fake timers).
 */
export function resetProjectHierarchyTreeScrollPreserveForTests (): void {
  projectHierarchyTreeScrollPreserveDepth = 0
  projectHierarchyTreeScrollPreserveTouch = null
}

function waitProjectHierarchyTreeAnimationFrame (
  requestAnimationFrameFn: (callback: () => void) => number
): Promise<void> {
  return new Promise((resolve) => {
    const onFrame = (): void => {
      resolve()
    }
    try {
      requestAnimationFrameFn(onFrame)
    } catch {
      // Bare window.requestAnimationFrame loses `this` when passed as a value → Illegal invocation.
      window.requestAnimationFrame(onFrame)
    }
  })
}

function detachProjectHierarchyTreeScrollLockListener (
  container: HTMLElement | null,
  onScroll: () => void
): void {
  if (container === null) {
    return
  }
  container.removeEventListener('scroll', onScroll)
}

/**
 * Re-applies active scroll preserve lock (rebinds remounted virt container).
 * No-op when preserve not active.
 */
export function touchProjectHierarchyTreePreservedScrollTop (): void {
  projectHierarchyTreeScrollPreserveTouch?.()
}

function syncProjectHierarchyTreeVirtualListToLockedScroll (deps: {
  getTreeRef?: () => I_faProjectHierarchyTreeHeTreeInstance | null
}): void {
  if (deps.getTreeRef === undefined) {
    return
  }
  requestProjectHierarchyTreeVirtualListUpdate(deps.getTreeRef())
}

async function settleProjectHierarchyTreePreservedScroll (deps: {
  getTreeRef?: () => I_faProjectHierarchyTreeHeTreeInstance | null
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  settleFrameCount: number
  stickScrollToLiveContainer: () => void
}): Promise<void> {
  deps.stickScrollToLiveContainer()
  syncProjectHierarchyTreeVirtualListToLockedScroll(deps)
  deps.stickScrollToLiveContainer()
  await deps.nextTick()
  for (let frameIndex = 0; frameIndex < deps.settleFrameCount; frameIndex += 1) {
    deps.stickScrollToLiveContainer()
    syncProjectHierarchyTreeVirtualListToLockedScroll(deps)
    deps.stickScrollToLiveContainer()
    await waitProjectHierarchyTreeAnimationFrame(deps.requestAnimationFrame)
  }
}

/**
 * Runs async work while holding scrollTop on the live scroll container.
 * Nested calls only run work (no second stick/restore) — avoids double jump on drag.
 * MutationObserver rebinds lock sync on remount so browser cannot paint scroll 0.
 * Optional getTreeRef forces vtlist.update during settle so expand remounts do not leave
 * a blank viewport under a locked mid/bottom scrollTop.
 */
export async function runWithPreservedProjectHierarchyTreeScrollTop (deps: {
  dragSessionScrollTopPx?: number
  getPersistedScrollTopPx?: () => number
  getTreeRef?: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  run: () => Promise<void>
  scrollTopPx?: number
  settleFrameCount?: number
}): Promise<void> {
  if (projectHierarchyTreeScrollPreserveDepth > 0) {
    await deps.run()
    return
  }
  projectHierarchyTreeScrollPreserveDepth += 1
  try {
    await runWithPreservedProjectHierarchyTreeScrollTopBody(deps)
  } finally {
    projectHierarchyTreeScrollPreserveDepth -= 1
  }
}

async function runWithPreservedProjectHierarchyTreeScrollTopBody (deps: {
  dragSessionScrollTopPx?: number
  getPersistedScrollTopPx?: () => number
  getTreeRef?: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  run: () => Promise<void>
  scrollTopPx?: number
  settleFrameCount?: number
}): Promise<void> {
  const liveScrollTopPx = readProjectHierarchyTreeScrollTopPx(
    resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
  )
  const scrollTopPx = deps.scrollTopPx ?? resolveProjectHierarchyTreePreservedScrollTopPx({
    dragSessionScrollTopPx: deps.dragSessionScrollTopPx ?? 0,
    liveScrollTopPx,
    persistedScrollTopPx: deps.getPersistedScrollTopPx?.() ?? 0
  })
  const settleFrameCount = deps.settleFrameCount ??
    PROJECT_HIERARCHY_TREE_SCROLL_PRESERVE_SETTLE_FRAMES

  let boundContainer: HTMLElement | null = null

  const lockScroll = (): void => {
    const live = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
    writeProjectHierarchyTreeScrollTopPx(live, scrollTopPx)
  }

  const onScroll = (): void => {
    lockScroll()
  }

  const syncScrollListener = (): void => {
    const live = resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
    if (live === boundContainer) {
      return
    }
    detachProjectHierarchyTreeScrollLockListener(boundContainer, onScroll)
    boundContainer = live
    if (boundContainer !== null) {
      boundContainer.addEventListener('scroll', onScroll)
    }
  }

  const stickScrollToLiveContainer = (): void => {
    syncScrollListener()
    lockScroll()
  }

  syncScrollListener()
  stickScrollToLiveContainer()
  projectHierarchyTreeScrollPreserveTouch = stickScrollToLiveContainer

  const host = deps.getTreeScrollHost()
  let mutationObserver: MutationObserver | null = null
  if (host !== null && typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(() => {
      stickScrollToLiveContainer()
    })
    mutationObserver.observe(host, {
      childList: true,
      subtree: true
    })
  }

  try {
    await deps.run()
    await settleProjectHierarchyTreePreservedScroll({
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame,
      settleFrameCount,
      stickScrollToLiveContainer,
      ...(deps.getTreeRef === undefined ? {} : { getTreeRef: deps.getTreeRef })
    })
  } finally {
    mutationObserver?.disconnect()
    stickScrollToLiveContainer()
    syncProjectHierarchyTreeVirtualListToLockedScroll(deps)
    stickScrollToLiveContainer()
    detachProjectHierarchyTreeScrollLockListener(boundContainer, onScroll)
    boundContainer = null
    projectHierarchyTreeScrollPreserveTouch = null
  }
}
