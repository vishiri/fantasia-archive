import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

import { S_DialogMarkdown } from 'app/src/stores/S_Dialog'

/**
 * Releases the markdown dialog lease when the root q-dialog closes.
 * Opening is reserved synchronously in openDialogMarkdownDocument and in DialogMarkdownDocument openDialog when needed.
 */
export function registerDialogMarkdownDocumentOpenLease (dialogModel: Ref<boolean>): void {
  const store = S_DialogMarkdown()
  watch(
    dialogModel,
    (isOpen, wasOpen) => {
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
