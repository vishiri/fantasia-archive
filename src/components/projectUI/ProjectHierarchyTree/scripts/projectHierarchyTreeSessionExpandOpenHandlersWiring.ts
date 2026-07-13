import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { handleProjectHierarchyTreeOpenIconClick } from './projectHierarchyTreeHeTreeOpenSafeWiring'
import { runProjectHierarchyTreeSessionExpandOpen } from './projectHierarchyTreeSessionExpandOpenWiring'

export function createProjectHierarchyTreeSessionExpandOpenHandlersWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  onNodeClose: (stat: { data: I_faProjectHierarchyTreeHeTreeNode }) => void
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  uiStateWiring: {
    markNodeOpen: (nodeId: string) => void
    reapplyLatentDescendantExpandState: () => Promise<void>
  }
}) {
  let openIconPointerWasOpen: boolean | null = null
  const expandOpenInFlight = new Set<string>()

  function shouldIgnoreExpandPersistMutation (): boolean {
    return isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    }) || deps.suppressTreeEmit.value
  }

  async function onNodeOpen (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { statOpen?: { open: boolean } }
  ): Promise<void> {
    if (shouldIgnoreExpandPersistMutation()) {
      return
    }
    const nodeId = stat.data.id
    if (expandOpenInFlight.has(nodeId)) {
      return
    }
    expandOpenInFlight.add(nodeId)
    try {
      const expandOpenDeps = {
        flushDeferredTreeRevisionPublish: deps.lazyLoadWiring.flushDeferredTreeRevisionPublish,
        loadChildrenForNode: deps.lazyLoadWiring.loadChildrenForNode,
        markNodeOpen: deps.uiStateWiring.markNodeOpen,
        node: stat.data,
        reapplyLatentDescendantExpandState: deps.uiStateWiring.reapplyLatentDescendantExpandState,
        treeRef: deps.treeComponentRef.value
      }
      if (options?.statOpen !== undefined) {
        await runProjectHierarchyTreeSessionExpandOpen({
          ...expandOpenDeps,
          statOpen: options.statOpen
        })
      } else {
        await runProjectHierarchyTreeSessionExpandOpen(expandOpenDeps)
      }
    } finally {
      expandOpenInFlight.delete(nodeId)
    }
  }

  function onNodeOpenIconPointerDown (stat: { open: boolean }): void {
    openIconPointerWasOpen = stat.open
  }

  async function onNodeOpenIconClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ): Promise<void> {
    if (isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    })) {
      return
    }
    await handleProjectHierarchyTreeOpenIconClick({
      getOpenIconPointerWasOpen: () => openIconPointerWasOpen,
      node,
      onNodeClose: deps.onNodeClose,
      onNodeOpen,
      setOpenIconPointerWasOpen: (value) => {
        openIconPointerWasOpen = value
      },
      stat
    })
  }

  return {
    onNodeOpen,
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown
  }
}
