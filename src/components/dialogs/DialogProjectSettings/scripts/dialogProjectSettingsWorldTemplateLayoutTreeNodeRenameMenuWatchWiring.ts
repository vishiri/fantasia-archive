import { nextTick, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { QInput } from 'quasar'

import { scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus } from './dialogProjectSettingsWorldTemplateLayoutRenameMenuFocusWiring'

export function wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers (params: {
  getRenameDraftSeed: () => string
  renameDraft: Ref<string>
  renameInputRef: Ref<QInput | null>
  renameMenuOpen: ComputedRef<boolean>
}): void {
  watch(params.renameMenuOpen, (open) => {
    if (!open) {
      return
    }
    scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus({
      focusRenameInput: () => {
        params.renameInputRef.value?.focus()
      },
      nextTick,
      requestAnimationFrame: (callback) => window.requestAnimationFrame(callback)
    })
  }, { flush: 'post' })

  watch(() => params.getRenameDraftSeed(), (seed) => {
    if (!params.renameMenuOpen.value) {
      params.renameDraft.value = seed
    }
  })
}
