import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import {
  handleProjectHierarchyTreeOpenIconClick,
  tryOpenHeTreeNodeAndParents
} from './projectHierarchyTreeHeTreeOpenSafeWiring'
import { createProjectHierarchyTreeExpandRowClickRouting } from './projectHierarchyTreeExpandRowClickRoutingWiring'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

export function createProjectHierarchyTreeSessionExpandHandlersWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  uiStateWiring: {
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
    markNodeOpen: (nodeId: string) => void
  }
}) {
  let openIconPointerWasOpen: boolean | null = null

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
    deps.uiStateWiring.markNodeOpen(stat.data.id)
    await deps.lazyLoadWiring.loadChildrenForNode(stat.data)
    const treeRef = deps.treeComponentRef.value
    if (treeRef !== null) {
      const openArgs = options?.statOpen === undefined
        ? {
            node: stat.data,
            treeRef
          }
        : {
            node: stat.data,
            statOpen: options.statOpen,
            treeRef
          }
      tryOpenHeTreeNodeAndParents(openArgs)
    }
    logProjectHierarchyTreeDebugSession({
      data: {
        nodeId: stat.data.id,
        nodeKind: stat.data.nodeKind
      },
      hypothesisId: 'D2',
      location: 'projectHierarchyTreeSessionExpandHandlersWiring.ts:onNodeOpen',
      message: 'node opened after lazy load',
      runId: 'doc-nested-open'
    })
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
      onNodeClose,
      onNodeOpen,
      setOpenIconPointerWasOpen: (value) => {
        openIconPointerWasOpen = value
      },
      stat
    })
  }

  const expandRowClickRouting = createProjectHierarchyTreeExpandRowClickRouting({
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown
  })

  function onNodeClose (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
    if (shouldIgnoreExpandPersistMutation()) {
      return
    }
    deps.uiStateWiring.markNodeClosed(stat.data.id, stat.data)
  }

  return {
    onNodeClose,
    onNodeOpen,
    onNodeOpenIconClick,
    onNodeOpenIconPointerDown,
    onNonWorldOpenIconClick: expandRowClickRouting.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: expandRowClickRouting.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: expandRowClickRouting.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: expandRowClickRouting.onWorldNodeRowPointerDown
  }
}
