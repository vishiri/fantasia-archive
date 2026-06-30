import type { I_faProjectHierarchyTreeLiveExpandDomState } from 'app/types/I_faProjectHierarchyTreeDomain'
function readProjectHierarchyTreeNodeIdFromRow (row: Element): string | null {
  const nodeElement = row.querySelector('[data-test-hierarchy-node-id]')
  if (!(nodeElement instanceof HTMLElement)) {
    return null
  }
  const nodeId = nodeElement.getAttribute('data-test-hierarchy-node-id')
  if (nodeId === null || nodeId.length === 0) {
    return null
  }
  return nodeId
}

function isProjectHierarchyTreeRowVisuallyExpanded (row: Element): boolean | null {
  const openIcon = row.querySelector('[data-test-locator="projectHierarchyTree-openIcon"]')
  if (openIcon === null) {
    return null
  }
  return openIcon.classList.contains('projectHierarchyTree__openIcon--open')
}

/**
 * Resolves the hierarchy tree DOM root used for live expand reads.
 */
export function resolveProjectHierarchyTreeScrollHostForDomRead (
  treeScrollHost: HTMLElement | null
): HTMLElement | null {
  if (treeScrollHost !== null) {
    return treeScrollHost
  }
  const host = document.querySelector('[data-test-locator="projectHierarchyTree-host"]')
  return host instanceof HTMLElement ? host : null
}

/**
 * Reads which hierarchy tree rows are visually expanded or collapsed from the sidebar DOM.
 */
export function collectProjectHierarchyTreeLiveExpandStateFromDom (
  treeScrollHost: HTMLElement | null
): I_faProjectHierarchyTreeLiveExpandDomState {
  const host = resolveProjectHierarchyTreeScrollHostForDomRead(treeScrollHost)
  if (host === null) {
    return {
      collapsedVisibleNodeIds: [],
      expandedNodeIds: [],
      rowCount: 0,
      scrollHostPresent: false
    }
  }
  const searchRoot = host.querySelector('.projectHierarchyTree') ?? host
  const expandedNodeIds: string[] = []
  const collapsedVisibleNodeIds: string[] = []
  const rows = searchRoot.querySelectorAll('.projectHierarchyTree__nodeRow')
  for (const row of rows) {
    const nodeId = readProjectHierarchyTreeNodeIdFromRow(row)
    if (nodeId === null) {
      continue
    }
    const isExpanded = isProjectHierarchyTreeRowVisuallyExpanded(row)
    if (isExpanded === null) {
      continue
    }
    if (isExpanded) {
      expandedNodeIds.push(nodeId)
      continue
    }
    collapsedVisibleNodeIds.push(nodeId)
  }
  return {
    collapsedVisibleNodeIds,
    expandedNodeIds,
    rowCount: rows.length,
    scrollHostPresent: true
  }
}

/**
 * Reads expanded node ids from visible open-icon rows in the hierarchy tree DOM.
 */
export function collectProjectHierarchyTreeLiveExpandedNodeIdsFromDom (
  treeScrollHost: HTMLElement | null
): string[] {
  return collectProjectHierarchyTreeLiveExpandStateFromDom(treeScrollHost).expandedNodeIds
}
