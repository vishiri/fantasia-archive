import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeTagRenameMergeConflict } from '../functions/projectHierarchyTreeTagNodes'
import { persistProjectHierarchyTreeTagRename } from './projectHierarchyTreeTagRenamePersistWiring'

function confirmProjectHierarchyTreeTagRename (
  deps: {
    applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
    getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
    refreshHierarchyTreeNodes: (nodeIds: string[]) => void
    refreshLayout: () => Promise<void>
    resyncTreeDataFromLayout: () => void
    treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  },
  confirm: {
    canConfirm: boolean
    nameDraft: string
    onDismiss: () => void
    readNameDraft: () => string
    readTagId: () => string | null
    tagId: string | null
  }
): void {
  if (!confirm.canConfirm || confirm.tagId === null) {
    return
  }
  const newName = confirm.nameDraft.trim()
  const tagId = confirm.tagId
  const shouldKeepOpen = (): boolean => {
    return confirm.readTagId() === tagId && confirm.readNameDraft().trim() !== newName
  }
  void persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs,
    getOpenedDocumentTabs: deps.getOpenedDocumentTabs,
    getTreeData: () => deps.treeData.value,
    newName,
    onDismiss: confirm.onDismiss,
    refreshHierarchyTreeNodes: deps.refreshHierarchyTreeNodes,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    shouldKeepOpen,
    tagId
  })
}

export function createProjectHierarchyTreeTagRenameDialogWiring (deps: {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resolveTagContextMenuAnchor: () => I_faProjectHierarchyTreeHeTreeNode | null
  resyncTreeDataFromLayout: () => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): {
    onConfirmRenameTag: () => void
    onDismissRenameTagDialog: () => void
    onRenameTagFromContextMenuClick: () => void
    renameTagCanConfirm: ComputedRef<boolean>
    renameTagCurrentName: Ref<string>
    renameTagDialogOpen: Ref<boolean>
    renameTagMergeWarning: ComputedRef<boolean>
    renameTagNameDraft: Ref<string>
  } {
  const renameTagDialogOpen = ref(false)
  const renameTagNameDraft = ref('')
  const renameTagId = ref<string | null>(null)
  const renameTagWorldId = ref<string | null>(null)
  const renameTagCurrentName = ref('')

  const existingTagNamesForRename = computed((): string[] => {
    const worldId = renameTagWorldId.value
    if (worldId === null) {
      return []
    }
    const names: string[] = []
    function visit (nodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
      for (const node of nodes) {
        if (node.nodeKind === 'tag' && node.worldId === worldId && node.tagId !== renameTagId.value) {
          names.push(node.label)
        }
        visit(node.children)
      }
    }
    visit(deps.treeData.value)
    return names
  })

  const renameTagMergeWarning = computed(() => {
    if (renameTagId.value === null) {
      return false
    }
    return resolveProjectHierarchyTreeTagRenameMergeConflict({
      existingTagNames: existingTagNamesForRename.value,
      newName: renameTagNameDraft.value,
      renameTagCurrentName: renameTagCurrentName.value,
      renameTagId: renameTagId.value
    })
  })
  const renameTagCanConfirm = computed(() => renameTagNameDraft.value.trim().length > 0)

  function onRenameTagFromContextMenuClick (): void {
    const tagNode = deps.resolveTagContextMenuAnchor()
    const tagId = tagNode?.tagId
    if (tagNode === null || typeof tagId !== 'string' || tagId.length === 0) {
      return
    }
    renameTagId.value = tagId
    renameTagWorldId.value = tagNode.worldId
    renameTagCurrentName.value = tagNode.label
    renameTagNameDraft.value = ''
    renameTagDialogOpen.value = true
  }

  function onDismissRenameTagDialog (): void {
    renameTagDialogOpen.value = false
    renameTagId.value = null
    renameTagWorldId.value = null
    renameTagCurrentName.value = ''
    renameTagNameDraft.value = ''
  }

  function onConfirmRenameTag (): void {
    confirmProjectHierarchyTreeTagRename(deps, {
      canConfirm: renameTagCanConfirm.value,
      nameDraft: renameTagNameDraft.value,
      onDismiss: onDismissRenameTagDialog,
      readNameDraft: () => renameTagNameDraft.value,
      readTagId: () => renameTagId.value,
      tagId: renameTagId.value
    })
  }

  return {
    onConfirmRenameTag,
    onDismissRenameTagDialog,
    onRenameTagFromContextMenuClick,
    renameTagCanConfirm,
    renameTagCurrentName,
    renameTagDialogOpen,
    renameTagMergeWarning,
    renameTagNameDraft
  }
}
