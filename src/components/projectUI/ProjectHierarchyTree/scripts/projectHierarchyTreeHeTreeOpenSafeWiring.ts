import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'

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
    return
  }
  const wasOpen = deps.getOpenIconPointerWasOpen() ?? deps.stat.open
  deps.setOpenIconPointerWasOpen(null)
  if (wasOpen) {
    deps.stat.open = false
    deps.onNodeClose({ data: deps.node })
    return
  }
  await deps.onNodeOpen({ data: deps.node }, { statOpen: deps.stat })
}
