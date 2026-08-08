import { computed, ref } from 'vue'
import type { Ref } from 'vue'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveProjectHierarchyTreeAddNewTemplateTitlePart } from '../functions/projectHierarchyTreeAddNewDocumentLabel'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { collectProjectHierarchyTreeTagAddDocumentPlacementOptions } from '../functions/projectHierarchyTreeTagMenuPlacements'
import { createProjectHierarchyTreeTagAddDocumentClickHandler } from './projectHierarchyTreeTagAddDocumentWiring'
import { createProjectHierarchyTreeTagDeleteDialogWiring } from './projectHierarchyTreeTagDeleteDialogWiring'
import { createProjectHierarchyTreeTagRenameDialogWiring } from './projectHierarchyTreeTagRenameDialogWiring'

export function createProjectHierarchyTreeTagDialogsWiring (deps: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  createTemporaryDocument: (input: {
    displayName: string
    initialTagsDraft: Array<{ id: string, name: string }>
    openMode: 'leftNavigate'
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resolvePreferredLanguageCode: () => T_faUserSettingsLanguageCode
  resyncTreeDataFromLayout: () => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const tagContextMenuAnchorNodeId = ref<string | null>(null)

  function resolveTagContextMenuAnchor (): I_faProjectHierarchyTreeHeTreeNode | null {
    const anchorId = tagContextMenuAnchorNodeId.value
    if (anchorId === null) {
      return null
    }
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, anchorId)
    if (node === null || node.nodeKind !== 'tag' || node.tagId === null) {
      return null
    }
    return node
  }

  function setTagContextMenuAnchorNodeId (nodeId: string | null): void {
    tagContextMenuAnchorNodeId.value = nodeId
  }

  const addDocumentPlacementOptions = computed(() => {
    const tagNode = resolveTagContextMenuAnchor()
    if (tagNode === null) {
      return []
    }
    return collectProjectHierarchyTreeTagAddDocumentPlacementOptions({
      preferredLanguageCode: deps.resolvePreferredLanguageCode(),
      resolveAddNewRowLabel: resolveProjectHierarchyTreeAddNewTemplateTitlePart,
      treeNodes: deps.treeData.value,
      worldId: tagNode.worldId
    })
  })

  const renameWiring = createProjectHierarchyTreeTagRenameDialogWiring({
    applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs,
    getOpenedDocumentTabs: deps.getOpenedDocumentTabs,
    refreshHierarchyTreeNodes: deps.refreshHierarchyTreeNodes,
    refreshLayout: deps.refreshLayout,
    resolveTagContextMenuAnchor,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    treeData: deps.treeData
  })
  const deleteWiring = createProjectHierarchyTreeTagDeleteDialogWiring({
    applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs,
    getOpenedDocumentTabs: deps.getOpenedDocumentTabs,
    refreshLayout: deps.refreshLayout,
    resolveTagContextMenuAnchor,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout
  })
  const onAddNewDocumentToThisTagClick = createProjectHierarchyTreeTagAddDocumentClickHandler({
    createTemporaryDocument: deps.createTemporaryDocument,
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    resolveTagContextMenuAnchor,
    treeData: deps.treeData
  })

  return {
    addDocumentPlacementOptions,
    deleteTagConfirmOpen: deleteWiring.deleteTagConfirmOpen,
    deleteTagName: deleteWiring.deleteTagName,
    onAddNewDocumentToThisTagClick,
    onConfirmDeleteTag: deleteWiring.onConfirmDeleteTag,
    onConfirmRenameTag: renameWiring.onConfirmRenameTag,
    onDeleteTagFromContextMenuClick: deleteWiring.onDeleteTagFromContextMenuClick,
    onDismissDeleteTagDialog: deleteWiring.onDismissDeleteTagDialog,
    onDismissRenameTagDialog: renameWiring.onDismissRenameTagDialog,
    onRenameTagFromContextMenuClick: renameWiring.onRenameTagFromContextMenuClick,
    renameTagCanConfirm: renameWiring.renameTagCanConfirm,
    renameTagCurrentName: renameWiring.renameTagCurrentName,
    renameTagDialogOpen: renameWiring.renameTagDialogOpen,
    renameTagMergeWarning: renameWiring.renameTagMergeWarning,
    renameTagNameDraft: renameWiring.renameTagNameDraft,
    resolveTagContextMenuAnchor,
    setTagContextMenuAnchorNodeId
  }
}
