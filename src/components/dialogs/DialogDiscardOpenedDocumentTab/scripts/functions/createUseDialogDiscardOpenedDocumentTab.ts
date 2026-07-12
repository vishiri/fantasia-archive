import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createUseDialogDiscardOpenedDocumentTab (deps: {
  S_FaOpenedDocuments: () => StoreGeneric & {
    confirmDiscardAndClose: (documentId: string) => Promise<void>
    dismissPendingClose: () => void
    findTabByDocumentId: (documentId: string) => { displayNameDraft: string } | null
  }
  computed: <T>(getter: () => T) => I_computedRef<T>
  ref: <T>(value: T) => I_ref<T>
  storeToRefs: T_piniaStoreToRefs
  watch: (
    source: () => string | null,
    effect: (documentId: string | null) => void
  ) => void
}): () => {
    dialogOpen: I_ref<boolean>
    documentName: I_computedRef<string>
    onConfirmDiscard: () => void
    onDialogHide: () => void
  } {
  return function useDialogDiscardOpenedDocumentTab () {
    const openedDocumentsStore = deps.S_FaOpenedDocuments()
    const { pendingCloseDocumentId } = deps.storeToRefs(openedDocumentsStore)!
    const dialogOpen = deps.ref(false)

    const documentName = deps.computed(() => {
      const documentId = pendingCloseDocumentId!.value
      if (documentId === null) {
        return ''
      }
      const tab = openedDocumentsStore.findTabByDocumentId(documentId)
      return tab?.displayNameDraft ?? documentId
    })

    deps.watch(
      () => pendingCloseDocumentId!.value,
      (documentId) => {
        dialogOpen.value = documentId !== null
      }
    )

    function onDialogHide (): void {
      if (pendingCloseDocumentId!.value !== null) {
        openedDocumentsStore.dismissPendingClose()
      }
    }

    function onConfirmDiscard (): void {
      const documentId = pendingCloseDocumentId!.value
      if (documentId === null) {
        return
      }
      dialogOpen.value = false
      void openedDocumentsStore.confirmDiscardAndClose(documentId)
    }

    const onConfirmDiscardHandler = onConfirmDiscard
    const onDialogHideHandler = onDialogHide

    return {
      dialogOpen,
      documentName,
      onConfirmDiscard: onConfirmDiscardHandler,
      onDialogHide: onDialogHideHandler
    }
  }
}
