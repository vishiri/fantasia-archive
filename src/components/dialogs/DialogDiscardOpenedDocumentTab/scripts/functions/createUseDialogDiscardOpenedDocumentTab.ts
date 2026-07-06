import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createUseDialogDiscardOpenedDocumentTab (deps: {
  S_FaOpenedDocuments: () => StoreGeneric & {
    confirmDiscardAndClose: (documentId: string) => Promise<void>
    dismissPendingClose: () => void
    findTabByDocumentId: (documentId: string) => { displayNameDraft: string } | null
  }
  computed: <T>(getter: () => T) => I_computedRef<T>
  i18n: {
    global: {
      t: (key: string, values?: Record<string, string>) => string
    }
  }
  ref: <T>(value: T) => I_ref<T>
  storeToRefs: T_piniaStoreToRefs
  watch: (
    source: () => string | null,
    effect: (documentId: string | null) => void
  ) => void
}): () => {
    dialogOpen: I_ref<boolean>
    dialogTitle: I_computedRef<string>
    onConfirmDiscard: () => void
    onDialogHide: () => void
  } {
  return function useDialogDiscardOpenedDocumentTab () {
    const openedDocumentsStore = deps.S_FaOpenedDocuments()
    const { pendingCloseDocumentId } = deps.storeToRefs(openedDocumentsStore)!
    const dialogOpen = deps.ref(false)

    const dialogTitle = deps.computed(() => {
      const documentId = pendingCloseDocumentId!.value
      if (documentId === null) {
        return ''
      }
      const tab = openedDocumentsStore.findTabByDocumentId(documentId)
      const documentName = tab?.displayNameDraft ?? documentId
      return deps.i18n.global.t('dialogs.discardOpenedDocumentTab.title', {
        documentName
      })
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

    return {
      dialogOpen,
      dialogTitle,
      onConfirmDiscard,
      onDialogHide
    }
  }
}
