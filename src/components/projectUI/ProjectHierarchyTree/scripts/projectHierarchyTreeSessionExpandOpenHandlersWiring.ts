import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { handleProjectHierarchyTreeOpenIconClick } from './projectHierarchyTreeHeTreeOpenSafeWiring'
import { createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler } from './projectHierarchyTreeSessionExpandOpenOnNodeOpenWiring'

export function createProjectHierarchyTreeSessionExpandOpenHandlersWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    commitStagedLoadedChildren?: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  onNodeClose: (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { source: 'heTreeEvent' | 'openIcon' }
  ) => void
  openIconExpandAnimationWiring: {
    scheduleOpenIconExpandAnimation: (nodeId: string) => void
  }
  runDeferredLazyLoadBatch: (
    runBatch: () => Promise<void>,
    options?: { skipReapplyHeTreeOpenState?: boolean }
  ) => Promise<void>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiStateWiring: {
    awaitHeTreeResyncIdle: () => Promise<void>
    isProgrammaticHeTreeResyncActive: () => boolean
    markNodeOpen: (nodeId: string) => void
    reapplyLatentDescendantExpandState: (options?: {
      deferHeTreeOpen?: boolean
    }) => Promise<void>
    resyncHeTreeAfterExpandPublish: (nodeId: string) => Promise<void>
  }
}) {
  let openIconPointerWasOpen: boolean | null = null
  const onNodeOpen = createProjectHierarchyTreeSessionExpandOpenOnNodeOpenHandler(deps)

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
      awaitHeTreeResyncIdle: deps.uiStateWiring.awaitHeTreeResyncIdle,
      getOpenIconPointerWasOpen: () => openIconPointerWasOpen,
      node,
      onNodeClose: deps.onNodeClose,
      onNodeOpen,
      scheduleOpenIconExpandAnimation: deps.openIconExpandAnimationWiring.scheduleOpenIconExpandAnimation,
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
