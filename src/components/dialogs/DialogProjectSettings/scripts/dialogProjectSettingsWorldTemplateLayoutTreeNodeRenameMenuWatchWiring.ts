import { nextTick, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { QInput } from 'quasar'

export function wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers (params: {
  getNodeLabel: () => string
  renameDraft: Ref<string>
  renameInputRef: Ref<QInput | null>
  renameMenuOpen: ComputedRef<boolean>
}): void {
  watch(params.renameMenuOpen, (open) => {
    if (!open) {
      return
    }
    void nextTick(() => {
      params.renameInputRef.value?.focus()
    })
  })

  watch(() => params.getNodeLabel(), (label) => {
    if (!params.renameMenuOpen.value) {
      params.renameDraft.value = label
    }
  })
}
