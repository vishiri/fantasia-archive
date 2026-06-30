import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

export function createProjectHierarchyTreeExpandRowClickRouting (deps: {
  onNodeOpenIconClick: (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ) => Promise<void>
  onNodeOpenIconPointerDown: (stat: { open: boolean }) => void
}) {
  function onNonWorldOpenIconPointerDown (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { open: boolean }
  ): void {
    if (node.nodeKind === 'world') {
      return
    }
    deps.onNodeOpenIconPointerDown(stat)
  }

  async function onNonWorldOpenIconClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ): Promise<void> {
    if (node.nodeKind === 'world') {
      return
    }
    await deps.onNodeOpenIconClick(node, stat)
  }

  function onWorldNodeRowPointerDown (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { open: boolean },
    event: PointerEvent
  ): void {
    if (node.nodeKind !== 'world') {
      return
    }
    event.stopPropagation()
    deps.onNodeOpenIconPointerDown(stat)
  }

  async function onWorldNodeRowClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean },
    event: MouseEvent
  ): Promise<void> {
    if (node.nodeKind !== 'world') {
      return
    }
    event.stopPropagation()
    await deps.onNodeOpenIconClick(node, stat)
  }

  return {
    onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick,
    onWorldNodeRowPointerDown
  }
}
