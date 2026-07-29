import type { T_dialogName, T_documentName } from 'app/types/T_appDialogsAndDocuments'

type T_dialogComponentStoreSnapshot = {
  componentDialogOpenCount: number
  dialogToOpen: T_dialogName
}

type T_dialogMarkdownStoreSnapshot = {
  documentToOpen: T_documentName
  markdownDialogOpenCount: number
}

/**
 * Creates helpers that attempt Quasar Escape dismiss on an already-open dialog/document.
 * Persistent settings refuse Escape (shake / stay open). Non-persistent surfaces close.
 */
export function createDialogManagementDismiss (deps: {
  dispatchWindowKeyEvent: (type: 'keydown' | 'keyup') => void
  getDialogComponentStore: () => T_dialogComponentStoreSnapshot
  getDialogMarkdownStore: () => T_dialogMarkdownStoreSnapshot
}): {
    dispatchFaQuasarEscapeDismiss: () => void
    isFaComponentDialogOpen: (dialogName: T_dialogName) => boolean
    isFaMarkdownDocumentOpen: (documentName: T_documentName) => boolean
    tryDismissFaComponentDialogIfOpen: (dialogName: T_dialogName) => boolean
    tryDismissFaMarkdownDocumentIfOpen: (documentName: T_documentName) => boolean
  } {
  function dispatchFaQuasarEscapeDismiss (): void {
    deps.dispatchWindowKeyEvent('keydown')
    deps.dispatchWindowKeyEvent('keyup')
  }

  function isFaComponentDialogOpen (dialogName: T_dialogName): boolean {
    const store = deps.getDialogComponentStore()
    return store.componentDialogOpenCount > 0 && store.dialogToOpen === dialogName
  }

  function isFaMarkdownDocumentOpen (documentName: T_documentName): boolean {
    const store = deps.getDialogMarkdownStore()
    return store.markdownDialogOpenCount > 0 && store.documentToOpen === documentName
  }

  function tryDismissFaComponentDialogIfOpen (dialogName: T_dialogName): boolean {
    if (!isFaComponentDialogOpen(dialogName)) {
      return false
    }
    dispatchFaQuasarEscapeDismiss()
    return true
  }

  function tryDismissFaMarkdownDocumentIfOpen (documentName: T_documentName): boolean {
    if (!isFaMarkdownDocumentOpen(documentName)) {
      return false
    }
    dispatchFaQuasarEscapeDismiss()
    return true
  }

  return {
    dispatchFaQuasarEscapeDismiss,
    isFaComponentDialogOpen,
    isFaMarkdownDocumentOpen,
    tryDismissFaComponentDialogIfOpen,
    tryDismissFaMarkdownDocumentIfOpen
  }
}
