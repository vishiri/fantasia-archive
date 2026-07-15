import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

export function createUseDialogDeleteOpenedDocument (deps: {
  S_FaOpenedDocuments: () => StoreGeneric & {
    confirmDeleteOpenedDocument: (documentId: string) => Promise<void>
    dismissPendingDelete: () => void
    findTabByDocumentId: (documentId: string) => {
      displayNameDraft: string
      tabLabel: string
    } | null
  }
  S_FaProjectHierarchyTree: () => {
    treeData: I_faProjectHierarchyTreeHeTreeNode[]
  }
  findProjectHierarchyTreeDocumentNodeByDocumentId: (
    treeData: I_faProjectHierarchyTreeHeTreeNode[],
    documentId: string
  ) => I_faProjectHierarchyTreeHeTreeNode | null
  computed: <T>(getter: () => T) => I_computedRef<T>
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  ref: <T>(value: T) => I_ref<T>
  resolveOpenedDocumentTabListLabel: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  storeToRefs: T_piniaStoreToRefs
  watch: (
    source: () => string | null,
    effect: (documentId: string | null) => void
  ) => void
}): () => {
    dialogOpen: I_ref<boolean>
    documentName: I_computedRef<string>
    onConfirmDelete: () => void
    onDialogHide: () => void
  } {
  return function useDialogDeleteOpenedDocument () {
    const openedDocumentsStore = deps.S_FaOpenedDocuments()
    const hierarchyTreeStore = deps.S_FaProjectHierarchyTree()
    const { pendingDeleteDocumentId } = deps.storeToRefs(openedDocumentsStore)!
    const dialogOpen = deps.ref(false)

    const documentName = deps.computed(() => {
      const documentId = pendingDeleteDocumentId!.value
      if (documentId === null) {
        return ''
      }
      const tab = openedDocumentsStore.findTabByDocumentId(documentId)
      if (tab !== null) {
        return deps.resolveOpenedDocumentTabListLabel({
          displayNameDraft: tab.displayNameDraft,
          tabLabel: tab.tabLabel
        })
      }
      const treeNode = deps.findProjectHierarchyTreeDocumentNodeByDocumentId(
        hierarchyTreeStore.treeData,
        documentId
      )
      if (treeNode !== null) {
        return treeNode.label
      }
      return documentId
    })

    deps.watch(
      () => pendingDeleteDocumentId!.value,
      (documentId) => {
        dialogOpen.value = documentId !== null
      }
    )

    function onDialogHide (): void {
      if (pendingDeleteDocumentId!.value !== null) {
        openedDocumentsStore.dismissPendingDelete()
      }
    }

    function onConfirmDelete (): void {
      const documentId = pendingDeleteDocumentId!.value
      if (documentId === null) {
        return
      }
      dialogOpen.value = false
      void openedDocumentsStore.confirmDeleteOpenedDocument(documentId)
    }

    return {
      dialogOpen,
      documentName,
      onConfirmDelete,
      onDialogHide
    }
  }
}
