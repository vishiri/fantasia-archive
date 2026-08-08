import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspacePlacement
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_lazyApi = {
  syncProjectHierarchyTreeNodeLazyChildren: (node: I_faProjectHierarchyTreeHeTreeNode) => void
}

function patchDocumentSubtreeIconsInPlace (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  placementIcon: string
): void {
  for (const node of nodes) {
    if (node.nodeKind !== 'document') {
      continue
    }
    node.icon = placementIcon
    if (node.childrenLoaded && node.children.length > 0) {
      patchDocumentSubtreeIconsInPlace(node.children, placementIcon)
    }
  }
}

export function patchWorkspaceLayoutPlacementNodeInPlace (input: {
  lazyPlaceholderApi: T_lazyApi
  placement: I_faProjectHierarchyTreeWorkspacePlacement
  placementNode: I_faProjectHierarchyTreeHeTreeNode
  resolvePlacementDisplayIcon: (icon: string) => string
}): void {
  const nickname = input.placement.nickname.trim()
  const placementIcon = input.resolvePlacementDisplayIcon(input.placement.icon)
  input.placementNode.label = nickname.length > 0 ? nickname : input.placement.displayName
  input.placementNode.icon = placementIcon
  input.placementNode.hasChildren = true
  input.placementNode.documentTemplateId = input.placement.documentTemplateId
  input.placementNode.titlePluralTranslations = input.placement.titlePluralTranslations
  input.placementNode.titleSingularTranslations = input.placement.titleSingularTranslations
  input.placementNode.documentCount = input.placement.documentCount
  input.placementNode.categoryCount = input.placement.categoryCount
  patchDocumentSubtreeIconsInPlace(input.placementNode.children, placementIcon)
  input.lazyPlaceholderApi.syncProjectHierarchyTreeNodeLazyChildren(input.placementNode)
}
