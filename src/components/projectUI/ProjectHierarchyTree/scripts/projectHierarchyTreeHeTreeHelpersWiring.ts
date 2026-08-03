import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'
import { PROJECT_HIERARCHY_TREE_ROOT_CLASS } from '../functions/projectHierarchyTreeConstants'
import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'

export function readProjectHierarchyTreeHeTreeLiveData (
  treeRef: I_faProjectHierarchyTreeHeTreeInstance | null
): I_faProjectHierarchyTreeHeTreeNode[] | null {
  const getData = treeRef?.getData
  if (typeof getData !== 'function') {
    return null
  }
  const data = getData.call(treeRef) as unknown
  if (!Array.isArray(data)) {
    return null
  }
  return data as I_faProjectHierarchyTreeHeTreeNode[]
}

function clearProjectHierarchyTreeHeTreeNodeTabIndex (host: HTMLElement | null): void {
  if (host === null) {
    return
  }
  const treeRoot = host.querySelector(`.${PROJECT_HIERARCHY_TREE_ROOT_CLASS}`)
  if (treeRoot === null) {
    return
  }
  const treeNodes = treeRoot.querySelectorAll('.tree-node')
  for (const node of treeNodes) {
    if (!(node instanceof HTMLElement)) {
      continue
    }
    if (node.tabIndex !== -1) {
      node.tabIndex = -1
    }
    if (document.activeElement === node) {
      node.blur()
    }
  }
}

export function bindProjectHierarchyTreeHeTreeNodeTabIndexGuard (deps: {
  onUnmounted: (hook: () => void) => void
  treeScrollHostRef: Ref<HTMLElement | null>
  watch: typeof watchFn
}): void {
  let observer: MutationObserver | null = null

  const disconnectObserver = (): void => {
    observer?.disconnect()
    observer = null
  }

  const syncTreeNodeTabIndex = (): void => {
    clearProjectHierarchyTreeHeTreeNodeTabIndex(deps.treeScrollHostRef.value)
  }

  deps.watch(deps.treeScrollHostRef, (host) => {
    disconnectObserver()
    if (host === null) {
      return
    }
    syncTreeNodeTabIndex()
    observer = new MutationObserver(syncTreeNodeTabIndex)
    observer.observe(host, {
      attributeFilter: ['tabindex'],
      attributes: true,
      childList: true,
      subtree: true
    })
  }, {
    immediate: true
  })

  deps.onUnmounted(disconnectObserver)
}

export const clearProjectHierarchyTreeHeTreeNodeTabIndexForTests =
  clearProjectHierarchyTreeHeTreeNodeTabIndex

export function isHeTreeStatNotFoundError (error: unknown): boolean {
  return error instanceof Error && error.name === 'StatNotFoundError'
}

export function tryOpenHeTreeNodeAndParents (deps: {
  node: I_faProjectHierarchyTreeHeTreeNode
  statOpen?: { open: boolean }
  treeRef: I_faProjectHierarchyTreeHeTreeInstance
}): boolean {
  try {
    deps.treeRef.openNodeAndParents(deps.node)
    if (deps.statOpen !== undefined) {
      deps.statOpen.open = true
    }
    return true
  } catch (error) {
    if (!isHeTreeStatNotFoundError(error)) {
      throw error
    }
    if (deps.statOpen !== undefined) {
      deps.statOpen.open = false
    }
    return false
  }
}

export async function handleProjectHierarchyTreeOpenIconClick (deps: {
  awaitHeTreeResyncIdle?: () => Promise<void>
  getOpenIconPointerWasOpen: () => boolean | null
  node: I_faProjectHierarchyTreeHeTreeNode
  onNodeClose: (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'openIcon' }
  ) => void
  onNodeOpen: (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'openIcon', statOpen?: { open: boolean } }
  ) => Promise<void>
  scheduleOpenIconExpandAnimation: (nodeId: string) => void
  setOpenIconPointerWasOpen: (value: boolean | null) => void
  stat: { children: unknown[], open: boolean }
}): Promise<void> {
  const statChildCount = deps.stat.children.length
  if (!projectHierarchyTreeNodeShowsOpenIcon(deps.node, statChildCount)) {
    deps.setOpenIconPointerWasOpen(null)
    if (deps.stat.open) {
      deps.stat.open = false
      if (deps.awaitHeTreeResyncIdle !== undefined) {
        await deps.awaitHeTreeResyncIdle()
      }
      deps.onNodeClose({ data: deps.node }, { source: 'openIcon' })
    }
    return
  }
  const wasOpen = deps.getOpenIconPointerWasOpen() ?? deps.stat.open
  deps.setOpenIconPointerWasOpen(null)
  if (wasOpen) {
    deps.stat.open = false
    if (deps.awaitHeTreeResyncIdle !== undefined) {
      await deps.awaitHeTreeResyncIdle()
    }
    deps.onNodeClose({ data: deps.node }, { source: 'openIcon' })
    return
  }
  deps.scheduleOpenIconExpandAnimation(deps.node.id)
  try {
    if (deps.awaitHeTreeResyncIdle !== undefined) {
      await deps.awaitHeTreeResyncIdle()
    }
    await deps.onNodeOpen(
      { data: deps.node },
      {
        source: 'openIcon',
        statOpen: deps.stat
      }
    )
  } catch (error) {
    deps.stat.open = false
    throw error
  }
}

export function waitForNextAnimationFrame (
  requestAnimationFrame: (callback: () => void) => number
): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

export function createProjectHierarchyTreeHeTreeResyncController (deps: {
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  requestAnimationFrame: (callback: () => void) => number
  suppressTreeEmit: Ref<boolean>
  treeMountKey: Ref<number>
}) {
  let heTreeResyncInFlight: Promise<void> | null = null
  let programmaticHeTreeResyncActive = false

  async function resyncHeTreeFromPublishedTreeData (options?: {
    remount?: boolean
  }): Promise<void> {
    if (heTreeResyncInFlight !== null) {
      await heTreeResyncInFlight
    }
    const remount = options?.remount === true
    const resyncWork = (async () => {
      deps.suppressTreeEmit.value = true
      programmaticHeTreeResyncActive = true
      if (remount) {
        deps.treeMountKey.value += 1
        await deps.nextTick()
        await deps.nextTick()
        await waitForNextAnimationFrame(deps.requestAnimationFrame)
        deps.reapplyHeTreeOpenState()
      } else {
        // Soft path: no remount. Full reapplyHeTreeOpenState after a root slice
        // caused whole-tree blink. Finish opens the expand target instead.
        await deps.nextTick()
      }
      programmaticHeTreeResyncActive = false
      deps.suppressTreeEmit.value = false
    })()
    heTreeResyncInFlight = resyncWork
    try {
      await resyncWork
    } finally {
      programmaticHeTreeResyncActive = false
      if (heTreeResyncInFlight === resyncWork) {
        heTreeResyncInFlight = null
      }
    }
  }

  async function awaitHeTreeResyncIdle (): Promise<void> {
    if (heTreeResyncInFlight !== null) {
      await heTreeResyncInFlight
    }
  }

  function isProgrammaticHeTreeResyncActive (): boolean {
    return programmaticHeTreeResyncActive
  }

  return {
    awaitHeTreeResyncIdle,
    isProgrammaticHeTreeResyncActive,
    resyncHeTreeFromPublishedTreeData
  }
}
