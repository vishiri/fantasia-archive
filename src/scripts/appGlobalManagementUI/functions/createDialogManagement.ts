import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { T_dialogName, T_documentName } from 'app/types/T_appDialogsAndDocuments'

type T_dialogComponentStore = {
  componentDialogOpenCount: number
  dialogToOpen: T_dialogName
  generateDialogUUID: () => void
  onComponentDialogBecameHidden: () => void
  onComponentDialogBecameVisible: () => void
}

type T_dialogMarkdownStore = {
  documentToOpen: T_documentName
  generateDialogUUID: () => void
  markdownDialogOpenCount: number
  onMarkdownDialogBecameHidden: () => void
  onMarkdownDialogBecameVisible: () => void
}

export function createDialogManagement (deps: {
  getDialogComponentStore: () => T_dialogComponentStore
  getDialogMarkdownStore: () => T_dialogMarkdownStore
  onUnmounted: (hook: () => void) => void
  watch: (
    source: I_ref<boolean>,
    effect: (isOpen: boolean, wasOpen: boolean | undefined) => void,
    options?: { immediate?: boolean }
  ) => void
}): {
    openDialogComponent: (inputDialogName: T_dialogName) => void
    openDialogMarkdownDocument: (inputDocumentName: T_documentName) => void
    registerComponentDialogStackGuard: (dialogModel: I_ref<boolean>) => void
    registerMarkdownDialogStackGuard: (dialogModel: I_ref<boolean>) => void
  } {
  function openDialogMarkdownDocument (inputDocumentName: T_documentName): void {
    const componentDialogStore = deps.getDialogComponentStore()
    if (componentDialogStore.componentDialogOpenCount > 0) {
      return
    }
    const markdownDialogStore = deps.getDialogMarkdownStore()
    if (markdownDialogStore.markdownDialogOpenCount === 0) {
      markdownDialogStore.onMarkdownDialogBecameVisible()
    }
    markdownDialogStore.documentToOpen = inputDocumentName
    markdownDialogStore.generateDialogUUID()
  }

  function openDialogComponent (inputDialogName: T_dialogName): void {
    const markdownDialogStore = deps.getDialogMarkdownStore()
    if (markdownDialogStore.markdownDialogOpenCount > 0) {
      return
    }
    const componentDialogStore = deps.getDialogComponentStore()
    if (componentDialogStore.componentDialogOpenCount > 0) {
      return
    }
    componentDialogStore.dialogToOpen = inputDialogName
    componentDialogStore.generateDialogUUID()
  }

  function registerComponentDialogStackGuard (dialogModel: I_ref<boolean>): void {
    const store = deps.getDialogComponentStore()
    deps.watch(
      dialogModel,
      (isOpen, wasOpen) => {
        if (isOpen && !wasOpen && store.componentDialogOpenCount === 0) {
          store.onComponentDialogBecameVisible()
        }
        if (!isOpen && wasOpen) {
          store.onComponentDialogBecameHidden()
        }
      },
      {
        immediate: true
      }
    )

    deps.onUnmounted(() => {
      if (dialogModel.value) {
        store.onComponentDialogBecameHidden()
      }
    })
  }

  function registerMarkdownDialogStackGuard (dialogModel: I_ref<boolean>): void {
    const store = deps.getDialogMarkdownStore()
    deps.watch(
      dialogModel,
      (isOpen, wasOpen) => {
        if (isOpen && !wasOpen && store.markdownDialogOpenCount === 0) {
          store.onMarkdownDialogBecameVisible()
        }
        if (!isOpen && wasOpen === true) {
          store.onMarkdownDialogBecameHidden()
        }
      },
      {
        immediate: true
      }
    )

    deps.onUnmounted(() => {
      if (dialogModel.value) {
        store.onMarkdownDialogBecameHidden()
      }
    })
  }

  return {
    openDialogComponent,
    openDialogMarkdownDocument,
    registerComponentDialogStackGuard,
    registerMarkdownDialogStackGuard
  }
}
