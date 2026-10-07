import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function resolveDeleteDialogDocumentName (input: {
  documentId: string
  findTabByDocumentId: (documentId: string) => {
    displayNameDraft: string
    tabLabel: string
  } | null
  findTreeNode: (documentId: string) => I_faProjectHierarchyTreeHeTreeNode | null
  resolveOpenedDocumentTabListLabel: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  unloadedDocumentDisplayName: string | null
}): string {
  const tab = input.findTabByDocumentId(input.documentId)
  if (tab !== null) {
    return input.resolveOpenedDocumentTabListLabel({
      displayNameDraft: tab.displayNameDraft,
      tabLabel: tab.tabLabel
    })
  }
  const treeNode = input.findTreeNode(input.documentId)
  if (treeNode !== null) {
    return treeNode.label
  }
  const unloadedName = input.unloadedDocumentDisplayName?.trim() ?? ''
  if (unloadedName.length > 0) {
    return unloadedName
  }
  return input.documentId
}

function scheduleUnloadedDocumentDisplayName (input: {
  documentId: string
  findTabByDocumentId: (documentId: string) => unknown
  findTreeNode: (documentId: string) => I_faProjectHierarchyTreeHeTreeNode | null
  pendingDeleteDocumentId: { value: string | null }
  readDocumentDisplayName: ((documentId: string) => Promise<string | null>) | undefined
  reportDocumentNameReadError: ((error: unknown) => void) | undefined
  unloadedDocumentDisplayName: { value: string | null }
}): void {
  const readDocumentDisplayName = input.readDocumentDisplayName
  if (readDocumentDisplayName === undefined) {
    return
  }
  if (input.findTabByDocumentId(input.documentId) !== null) {
    return
  }
  if (input.findTreeNode(input.documentId) !== null) {
    return
  }
  const documentId = input.documentId
  void readDocumentDisplayName(documentId).then((name) => {
    if (input.pendingDeleteDocumentId.value !== documentId) {
      return
    }
    input.unloadedDocumentDisplayName.value = name
  }, (error: unknown) => {
    if (input.pendingDeleteDocumentId.value !== documentId) {
      return
    }
    input.reportDocumentNameReadError?.(error)
  })
}

type T_createUseDialogDeleteOpenedDocumentDeps = {
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
  readDocumentDisplayName?: (documentId: string) => Promise<string | null>
  reportDocumentNameReadError?: (error: unknown) => void
  resolveOpenedDocumentTabListLabel: (input: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  storeToRefs: T_piniaStoreToRefs
  watch: (
    source: () => string | null,
    effect: (documentId: string | null) => void
  ) => void
}

export function createUseDialogDeleteOpenedDocument (
  deps: T_createUseDialogDeleteOpenedDocumentDeps
): () => {
    dialogOpen: I_ref<boolean>
    documentName: I_computedRef<string>
    onConfirmDelete: () => void
    onDialogHide: () => void
  } {
  return function useDialogDeleteOpenedDocument () {
    const openedDocumentsStore = deps.S_FaOpenedDocuments()
    const hierarchyTreeStore = deps.S_FaProjectHierarchyTree()
    const { pendingDeleteDocumentId } = deps.storeToRefs(openedDocumentsStore)!
    const dialogOpen = deps.ref(pendingDeleteDocumentId!.value !== null)
    const unloadedDocumentDisplayName = deps.ref<string | null>(null)

    function findTreeNode (documentId: string): I_faProjectHierarchyTreeHeTreeNode | null {
      return deps.findProjectHierarchyTreeDocumentNodeByDocumentId(
        hierarchyTreeStore.treeData,
        documentId
      )
    }

    const documentName = deps.computed(() => {
      const documentId = pendingDeleteDocumentId!.value
      if (documentId === null) {
        return ''
      }
      return resolveDeleteDialogDocumentName({
        documentId,
        findTabByDocumentId: openedDocumentsStore.findTabByDocumentId,
        findTreeNode,
        resolveOpenedDocumentTabListLabel: deps.resolveOpenedDocumentTabListLabel,
        unloadedDocumentDisplayName: unloadedDocumentDisplayName.value
      })
    })

    function applyPendingDeleteDocument (documentId: string | null): void {
      dialogOpen.value = documentId !== null
      unloadedDocumentDisplayName.value = null
      if (documentId === null) {
        return
      }
      scheduleUnloadedDocumentDisplayName({
        documentId,
        findTabByDocumentId: openedDocumentsStore.findTabByDocumentId,
        findTreeNode,
        pendingDeleteDocumentId: pendingDeleteDocumentId!,
        readDocumentDisplayName: deps.readDocumentDisplayName,
        reportDocumentNameReadError: deps.reportDocumentNameReadError,
        unloadedDocumentDisplayName
      })
    }

    applyPendingDeleteDocument(pendingDeleteDocumentId!.value)
    deps.watch(
      () => pendingDeleteDocumentId!.value,
      (documentId) => {
        applyPendingDeleteDocument(documentId)
      }
    )

    let confirmStarted = false

    function onDialogHide (): void {
      if (pendingDeleteDocumentId!.value === null) {
        return
      }
      if (confirmStarted) {
        dialogOpen.value = true
        return
      }
      openedDocumentsStore.dismissPendingDelete()
    }

    function finishConfirmDelete (): void {
      confirmStarted = false
    }

    function onConfirmDelete (): void {
      const documentId = pendingDeleteDocumentId!.value
      if (documentId === null || confirmStarted) {
        return
      }
      confirmStarted = true
      void openedDocumentsStore.confirmDeleteOpenedDocument(documentId).then(
        finishConfirmDelete,
        finishConfirmDelete
      )
    }

    return {
      dialogOpen,
      documentName,
      onConfirmDelete,
      onDialogHide
    }
  }
}
