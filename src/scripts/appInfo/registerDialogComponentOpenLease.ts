import type { Ref } from 'vue'
import { onUnmounted, watch } from 'vue'

import { S_DialogComponent } from 'app/src/stores/S_Dialog'

/**
 * Tracks visibility of one component-dialog root q-dialog so openDialogComponent can block stacking.
 */
export function registerDialogComponentOpenLease (dialogModel: Ref<boolean>): void {
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
