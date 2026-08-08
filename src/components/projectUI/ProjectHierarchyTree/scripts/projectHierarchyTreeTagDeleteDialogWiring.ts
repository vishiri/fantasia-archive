import { ref } from 'vue'
import type { Ref } from 'vue'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { persistProjectHierarchyTreeTagDelete } from './projectHierarchyTreeTagDeletePersistWiring'

export function createProjectHierarchyTreeTagDeleteDialogWiring (deps: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  refreshLayout: () => Promise<void>
  resolveTagContextMenuAnchor: () => I_faProjectHierarchyTreeHeTreeNode | null
  resyncTreeDataFromLayout: () => { structureMatched: boolean } | void
}): {
    deleteTagConfirmOpen: Ref<boolean>
    deleteTagName: Ref<string>
    onConfirmDeleteTag: () => void
    onDeleteTagFromContextMenuClick: () => void
    onDismissDeleteTagDialog: () => void
  } {
  const deleteTagConfirmOpen = ref(false)
  const deleteTagId = ref<string | null>(null)
  const deleteTagName = ref('')

  function onDeleteTagFromContextMenuClick (): void {
    const tagNode = deps.resolveTagContextMenuAnchor()
    const tagId = tagNode?.tagId
    if (tagNode === null || typeof tagId !== 'string' || tagId.length === 0) {
      return
    }
    deleteTagId.value = tagId
    deleteTagName.value = tagNode.label
    deleteTagConfirmOpen.value = true
  }

  function onDismissDeleteTagDialog (): void {
    deleteTagConfirmOpen.value = false
    deleteTagId.value = null
    deleteTagName.value = ''
  }

  function onConfirmDeleteTag (): void {
    const tagId = deleteTagId.value
    if (tagId === null) {
      return
    }
    void persistProjectHierarchyTreeTagDelete({
      applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs,
      getOpenedDocumentTabs: deps.getOpenedDocumentTabs,
      onDismiss: onDismissDeleteTagDialog,
      refreshLayout: deps.refreshLayout,
      resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
      tagId
    })
  }

  return {
    deleteTagConfirmOpen,
    deleteTagName,
    onConfirmDeleteTag,
    onDeleteTagFromContextMenuClick,
    onDismissDeleteTagDialog
  }
}
