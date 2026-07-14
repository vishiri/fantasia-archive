import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreePlacementAddNewSource
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveProjectHierarchyTreeAddNewRowLabel } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON } from '../functions/projectHierarchyTreeConstants'
import {
  isProjectHierarchyTreeAddNewDocumentCreateSourceNode,
  isProjectHierarchyTreeAddNewDocumentNode,
  resolveProjectHierarchyTreeAddNewDocumentNodeId
} from '../functions/projectHierarchyTreeAddNewDocumentNodeKind'

export { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON }
export {
  isProjectHierarchyTreeAddNewDocumentCreateSourceNode,
  isProjectHierarchyTreeAddNewDocumentNode,
  resolveProjectHierarchyTreeAddNewDocumentNodeId
}
export { PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_NODE_ID_SUFFIX } from '../functions/projectHierarchyTreeAddNewDocumentNodeKind'

export function createProjectHierarchyTreeAddNewDocumentNode (input: {
  label: string
  placement: I_faProjectHierarchyTreePlacementAddNewSource
}): I_faProjectHierarchyTreeHeTreeNode {
  const placementId = input.placement.placementId ?? input.placement.id
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: input.placement.documentTemplateId ?? null,
    groupId: null,
    hasChildren: false,
    icon: PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON,
    id: resolveProjectHierarchyTreeAddNewDocumentNodeId(placementId),
    label: input.label,
    nodeKind: 'addNewDocument',
    placementId,
    titlePluralTranslations: input.placement.titlePluralTranslations,
    titleSingularTranslations: input.placement.titleSingularTranslations,
    worldColor: input.placement.worldColor,
    worldId: input.placement.worldId
  }
}

export function ensureProjectHierarchyTreeAddNewNodePinnedToBottom (
  children: I_faProjectHierarchyTreeHeTreeNode[]
): boolean {
  const addNewIndex = children.findIndex((child) => isProjectHierarchyTreeAddNewDocumentNode(child))
  if (addNewIndex === -1) {
    return false
  }
  if (addNewIndex === children.length - 1) {
    return false
  }
  const addNewNode = children[addNewIndex]
  if (addNewNode === undefined) {
    return false
  }
  const withoutAddNew = children.filter((child) => !isProjectHierarchyTreeAddNewDocumentNode(child))
  withoutAddNew.push(addNewNode)
  children.length = 0
  children.push(...withoutAddNew)
  return true
}

export function appendOrRefreshProjectHierarchyTreeAddNewDocumentNode (input: {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  placement: I_faProjectHierarchyTreePlacementAddNewSource
  preferredLanguageCode: T_faUserSettingsLanguageCode
}): void {
  const label = resolveProjectHierarchyTreeAddNewRowLabel({
    preferredLanguageCode: input.preferredLanguageCode,
    titlePluralTranslations: input.placement.titlePluralTranslations ?? {},
    titleSingularTranslations: input.placement.titleSingularTranslations ?? {}
  })
  const placementId = input.placement.placementId ?? input.placement.id
  const addNewId = resolveProjectHierarchyTreeAddNewDocumentNodeId(placementId)
  const existing = input.children.find((child) => child.id === addNewId)
  if (existing !== undefined) {
    existing.label = label
    existing.documentTemplateId = input.placement.documentTemplateId ?? null
    existing.icon = PROJECT_HIERARCHY_TREE_ADD_NEW_DOCUMENT_ICON
    existing.titlePluralTranslations = input.placement.titlePluralTranslations
    existing.titleSingularTranslations = input.placement.titleSingularTranslations
    ensureProjectHierarchyTreeAddNewNodePinnedToBottom(input.children)
    return
  }
  const withoutAddNew = input.children.filter((child) => !isProjectHierarchyTreeAddNewDocumentNode(child))
  withoutAddNew.push(createProjectHierarchyTreeAddNewDocumentNode({
    label,
    placement: input.placement
  }))
  input.children.length = 0
  input.children.push(...withoutAddNew)
}

export function refreshProjectHierarchyTreeAddNewDocumentLabelsInTree (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  preferredLanguageCode: T_faUserSettingsLanguageCode
): void {
  for (const node of treeNodes) {
    if (node.nodeKind === 'templatePlacement' && node.childrenLoaded) {
      appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
        children: node.children,
        placement: node,
        preferredLanguageCode
      })
    }
    if (node.children.length > 0) {
      refreshProjectHierarchyTreeAddNewDocumentLabelsInTree(node.children, preferredLanguageCode)
    }
  }
}

export function finalizeProjectHierarchyTreePlacementTopLevelChildren (input: {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  placement: I_faProjectHierarchyTreePlacementAddNewSource
  preferredLanguageCode: T_faUserSettingsLanguageCode
}): I_faProjectHierarchyTreeHeTreeNode[] {
  const docChildren = input.children.filter((child) => !isProjectHierarchyTreeAddNewDocumentNode(child))
  appendOrRefreshProjectHierarchyTreeAddNewDocumentNode({
    children: docChildren,
    placement: input.placement,
    preferredLanguageCode: input.preferredLanguageCode
  })
  return docChildren
}
