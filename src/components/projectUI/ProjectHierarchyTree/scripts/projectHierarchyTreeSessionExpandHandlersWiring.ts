import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import {
  handleProjectHierarchyTreeOpenIconClick,
  tryOpenHeTreeNodeAndParents
} from './projectHierarchyTreeHeTreeOpenSafeWiring'
import { createProjectHierarchyTreeExpandRowClickRouting } from './projectHierarchyTreeExpandRowClickRoutingWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'

export function createProjectHierarchyTreeSessionExpandHandlersWiring (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
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
      deps.uiStateWiring.markNodeOpen(nodeId)
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
      onNodeClose,
      onNodeOpen,
      setOpenIconPointerWasOpen: (value) => {
        openIconPointerWasOpen = value
      },
      stat
    })
  }

  const expandRowClickRouting = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
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
