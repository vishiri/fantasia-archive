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
