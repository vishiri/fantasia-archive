import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'

import { createMapHierarchyDocumentChildrenToTreeNodes } from '../functions/mapHierarchyDocumentChildrenToTreeNodes'
import { createMapWorkspaceLayoutToHierarchyTreeSkeleton } from '../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import {
  PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON,
  PROJECT_HIERARCHY_TREE_GROUP_ICON
} from '../functions/projectHierarchyTreeConstants'
import { createProjectHierarchyTreeLazyPlaceholderApi } from '../functions/projectHierarchyTreeLazyPlaceholder'

const lazyPlaceholderApi = createProjectHierarchyTreeLazyPlaceholderApi()

function resolvePlacementDisplayIcon (icon: string): string {
  return resolveTrimmedIconOrDefault(icon, PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON)
}

const workspaceLayoutMapperApi = createMapWorkspaceLayoutToHierarchyTreeSkeleton({
  groupIcon: PROJECT_HIERARCHY_TREE_GROUP_ICON,
  lazyPlaceholderApi,
  resolvePlacementDisplayIcon
})

export const mapWorkspaceLayoutToHierarchyTreeSkeleton =
  workspaceLayoutMapperApi.mapWorkspaceLayoutToHierarchyTreeSkeleton

export const patchHierarchyTreeSkeletonLabelsInPlace =
  workspaceLayoutMapperApi.patchHierarchyTreeSkeletonLabelsInPlace

export const mapHierarchyDocumentChildrenToTreeNodes = createMapHierarchyDocumentChildrenToTreeNodes({
  lazyPlaceholderApi,
  resolvePlacementDisplayIcon
})
