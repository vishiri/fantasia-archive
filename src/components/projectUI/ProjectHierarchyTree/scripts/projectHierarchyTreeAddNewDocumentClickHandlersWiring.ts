import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faOpenedDocumentOpenMode } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { isProjectHierarchyTreeAddNewDocumentNode } from './projectHierarchyTreeAddNewDocumentNode'
import { resolveProjectHierarchyTreeNewDocumentDisplayName } from '../functions/projectHierarchyTreeAddNewDocumentLabel'

export function createProjectHierarchyTreeAddNewDocumentClickHandlers (deps: {
  createTemporaryDocument: (input: {
    displayName: string
    openMode: T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
}): {
    onAddNewDocumentRowAuxClick: (node: I_faProjectHierarchyTreeHeTreeNode, event: MouseEvent) => void
    onAddNewDocumentRowClick: (node: I_faProjectHierarchyTreeHeTreeNode, event?: MouseEvent) => void
  } {
  function resolveCreateInput (
    node: I_faProjectHierarchyTreeHeTreeNode,
    openMode: T_faOpenedDocumentOpenMode
  ): {
    displayName: string
    openMode: T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  } | null {
    if (!isProjectHierarchyTreeAddNewDocumentNode(node)) {
      return null
    }
    const templateId = node.documentTemplateId
    if (templateId === undefined || templateId === null || templateId.length === 0) {
      return null
    }
    const displayName = resolveProjectHierarchyTreeNewDocumentDisplayName({
      preferredLanguageCode: deps.resolvePreferredLanguageCode(),
      titlePluralTranslations: node.titlePluralTranslations ?? {},
      titleSingularTranslations: node.titleSingularTranslations ?? {}
    })
    return {
      displayName,
      openMode,
      parentDocumentId: null,
      templateId,
      worldId: node.worldId
    }
  }

  function onAddNewDocumentRowClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event?: MouseEvent
  ): void {
    const input = resolveCreateInput(node, 'leftNavigate')
    if (input === null) {
      return
    }
    event?.stopPropagation()
    void deps.createTemporaryDocument(input)
  }

  function onAddNewDocumentRowAuxClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    if (event.button !== 1) {
      return
    }
    const input = resolveCreateInput(node, 'middleBackground')
    if (input === null) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    void deps.createTemporaryDocument(input)
  }

  return {
    onAddNewDocumentRowAuxClick,
    onAddNewDocumentRowClick
  }
}
