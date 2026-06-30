import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'

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
    return true
  } catch (error) {
    if (!isHeTreeStatNotFoundError(error)) {
      throw error
    }
    if (deps.statOpen !== undefined) {
      deps.statOpen.open = false
    }
    // #region agent log
    logProjectHierarchyTreeDebugSession({
      data: {
        nodeId: deps.node.id,
        nodeKind: deps.node.nodeKind
      },
      hypothesisId: 'S2',
      location: 'projectHierarchyTreeHeTreeOpenSafeWiring.ts:tryOpenHeTreeNodeAndParents',
      message: 'openNodeAndParents skipped stale he-tree stat',
      runId: 'stat-not-found'
    })
    // #endregion
    return false
  }
}

export async function handleProjectHierarchyTreeOpenIconClick (deps: {
  getOpenIconPointerWasOpen: () => boolean | null
  node: I_faProjectHierarchyTreeHeTreeNode
  onNodeClose: (stat: { data: I_faProjectHierarchyTreeHeTreeNode }) => void
  onNodeOpen: (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode },
    options?: { statOpen?: { open: boolean } }
  ) => Promise<void>
  setOpenIconPointerWasOpen: (value: boolean | null) => void
  stat: { children: unknown[], open: boolean }
}): Promise<void> {
  const statChildCount = deps.stat.children.length
  if (!projectHierarchyTreeNodeShowsOpenIcon(deps.node, statChildCount)) {
    deps.setOpenIconPointerWasOpen(null)
    if (deps.stat.open) {
      deps.stat.open = false
      deps.onNodeClose({ data: deps.node })
    }
    // #region agent log
    logProjectHierarchyTreeDebugSession({
      data: {
        nodeId: deps.node.id,
        nodeKind: deps.node.nodeKind,
        statChildCount,
        statOpen: deps.stat.open
      },
      hypothesisId: 'S1',
      location: 'projectHierarchyTreeHeTreeOpenSafeWiring.ts:handleProjectHierarchyTreeOpenIconClick',
      message: 'ignored open icon click without expandable children',
      runId: 'stat-not-found'
    })
    // #endregion
    return
  }
  const wasOpen = deps.getOpenIconPointerWasOpen() ?? deps.stat.open
  deps.setOpenIconPointerWasOpen(null)
  // #region agent log
  logProjectHierarchyTreeDebugSession({
    data: {
      nodeId: deps.node.id,
      nodeKind: deps.node.nodeKind,
      statOpen: deps.stat.open,
      wasOpen
    },
    hypothesisId: 'E1',
    location: 'projectHierarchyTreeHeTreeOpenSafeWiring.ts:handleProjectHierarchyTreeOpenIconClick',
    message: 'open icon click received',
    runId: 'post-fix-drag-handle'
  })
  // #endregion
  if (wasOpen) {
    deps.stat.open = false
    logProjectHierarchyTreeDebugSession({
      data: {
        nodeId: deps.node.id,
        nodeKind: deps.node.nodeKind
      },
      hypothesisId: 'D2',
      location: 'projectHierarchyTreeHeTreeOpenSafeWiring.ts:handleProjectHierarchyTreeOpenIconClick',
      message: 'open icon collapse click',
      runId: 'doc-nested-open'
    })
    deps.onNodeClose({ data: deps.node })
    return
  }
  deps.stat.open = true
  await deps.onNodeOpen({ data: deps.node }, { statOpen: deps.stat })
}
