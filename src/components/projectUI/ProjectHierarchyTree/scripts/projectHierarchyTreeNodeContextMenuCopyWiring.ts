import type { Ref } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  resolveProjectAppControlBarTabCopyBackgroundColorText,
  resolveProjectAppControlBarTabCopyTextColorText
} from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyAppearanceColor'
import { resolveProjectAppControlBarTabCopyNameText } from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyName'

import { resolveHierarchyTreeDocumentNodeFromAnchor } from './projectHierarchyTreeDocumentNodeLookup'

export function buildProjectHierarchyTreeNodeContextMenuCopyHandlers (input: {
  contextMenuAnchorNodeId: Ref<string | null>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): {
    onCopyBackgroundColorClick: () => void
    onCopyNameClick: () => void
    onCopyTextColorClick: () => void
  } {
  function onCopyNameClick (): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const node = resolveHierarchyTreeDocumentNodeFromAnchor(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyNameText(node.label)
    if (copyText === null) {
      return
    }

    const documentId = node.documentId
    if (documentId === null) {
      return
    }

    input.runFaAction('copyHierarchyTreeDocumentName', { documentId })
  }

  function onCopyTextColorClick (): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const node = resolveHierarchyTreeDocumentNodeFromAnchor(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyTextColorText({
      documentTextColorDraft: node.documentTextColor ?? ''
    })
    if (copyText === null) {
      return
    }

    const documentId = node.documentId
    if (documentId === null) {
      return
    }

    input.runFaAction('copyHierarchyTreeDocumentTextColor', { documentId })
  }

  function onCopyBackgroundColorClick (): void {
    const anchorNodeId = input.contextMenuAnchorNodeId.value
    if (anchorNodeId === null) {
      return
    }

    const node = resolveHierarchyTreeDocumentNodeFromAnchor(input.treeData.value, anchorNodeId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyBackgroundColorText({
      documentBackgroundColorDraft: node.documentBackgroundColor ?? ''
    })
    if (copyText === null) {
      return
    }

    const documentId = node.documentId
    if (documentId === null) {
      return
    }

    input.runFaAction('copyHierarchyTreeDocumentBackgroundColor', { documentId })
  }

  return {
    onCopyBackgroundColorClick,
    onCopyNameClick,
    onCopyTextColorClick
  }
}
