import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { isProjectHierarchyTreeAddNewDocumentCreateSourceNode } from './projectHierarchyTreeAddNewDocumentNode'

export function createProjectHierarchyTreeTagAddDocumentClickHandler (deps: {
  createTemporaryDocument: (input: {
    displayName: string
    initialTagsDraft: Array<{ id: string, name: string }>
    openMode: 'leftNavigate'
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
  resolveTagContextMenuAnchor: () => I_faProjectHierarchyTreeHeTreeNode | null
  treeData: I_faProjectHierarchyTreeHeTreeNode[] | { value: I_faProjectHierarchyTreeHeTreeNode[] }
}): (placementNodeId: string) => void {
  function readTreeData (): I_faProjectHierarchyTreeHeTreeNode[] {
    return Array.isArray(deps.treeData) ? deps.treeData : deps.treeData.value
  }

  return function onAddNewDocumentToThisTagClick (placementNodeId: string): void {
    const tagNode = deps.resolveTagContextMenuAnchor()
    const tagId = tagNode?.tagId
    if (tagNode === null || typeof tagId !== 'string' || tagId.length === 0) {
      return
    }
    const placement = findProjectHierarchyTreeNodeById(readTreeData(), placementNodeId)
    if (
      placement === null ||
      !isProjectHierarchyTreeAddNewDocumentCreateSourceNode(placement) ||
      placement.documentTemplateId === null ||
      placement.documentTemplateId === undefined ||
      placement.documentTemplateId.length === 0
    ) {
      return
    }
    void deps.createTemporaryDocument({
      displayName: resolveProjectHierarchyTreeNewDocumentDisplayName({
        preferredLanguageCode: deps.resolvePreferredLanguageCode(),
        titlePluralTranslations: placement.titlePluralTranslations ?? {},
        titleSingularTranslations: placement.titleSingularTranslations ?? {}
      }),
      initialTagsDraft: [{
        id: tagId,
        name: tagNode.label
      }],
      openMode: 'leftNavigate',
      parentDocumentId: null,
      templateId: placement.documentTemplateId,
      worldId: placement.worldId
    })
  }
}
