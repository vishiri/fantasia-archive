import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

import type { T_dialogName, T_documentName } from 'app/types/T_appDialogsAndDocuments'
import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

/**
 * Opens to the particular markdown document based on the input document name.
 * @param inputDocumentName - The name of the document to open.
 */
export const openDialogMarkdownDocument = (inputDocumentName: T_documentName) => {
  const componentDialogStore = S_DialogComponent()
  if (componentDialogStore.componentDialogOpenCount > 0) {
    return
  }
  const markdownDialogStore = S_DialogMarkdown()
  if (markdownDialogStore.markdownDialogOpenCount === 0) {
    markdownDialogStore.onMarkdownDialogBecameVisible()
  }
  markdownDialogStore.documentToOpen = inputDocumentName
  markdownDialogStore.generateDialogUUID()
}

/**
 * Opens the particular dialog component based on the input dialog name.
 * @param inputDialogName - The name of the dialog component to open.
 */
export const openDialogComponent = (inputDialogName: T_dialogName) => {
  const markdownDialogStore = S_DialogMarkdown()
  if (markdownDialogStore.markdownDialogOpenCount > 0) {
    return
  }
  const componentDialogStore = S_DialogComponent()
  if (componentDialogStore.componentDialogOpenCount > 0) {
    return
  }
  componentDialogStore.dialogToOpen = inputDialogName
  componentDialogStore.generateDialogUUID()
}

/**
 * Watches a root component q-dialog model and updates S_DialogComponent.componentDialogOpenCount
 * so openDialogMarkdownDocument and openDialogComponent can avoid stacking incompatible surfaces.
 */
export function registerComponentDialogStackGuard (dialogModel: Ref<boolean>): void {
  const store = S_DialogComponent()
  watch(
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

  onUnmounted(() => {
    if (dialogModel.value) {
      store.onComponentDialogBecameHidden()
    }
  })
}

/**
 * Watches a root markdown q-dialog model and keeps S_DialogMarkdown.markdownDialogOpenCount aligned with visibility.
 * Increments when the dialog opens from zero so directInput and store-driven opens share the same stack contract as openDialogMarkdownDocument.
 * Decrements on close or unmount while open.
 */
export function registerMarkdownDialogStackGuard (dialogModel: Ref<boolean>): void {
  const store = S_DialogMarkdown()
  watch(
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

  onUnmounted(() => {
    if (dialogModel.value) {
      store.onMarkdownDialogBecameHidden()
    }
  })
}
