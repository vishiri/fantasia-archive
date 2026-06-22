import { watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'

export function wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers (params: {
  getRenameTranslationsDraftSeed: () => T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft
  renameMenuOpen: ComputedRef<boolean>
  renameTranslationsDraft: Ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>
}): void {
  watch(() => params.getRenameTranslationsDraftSeed(), (seed) => {
    if (!params.renameMenuOpen.value) {
      params.renameTranslationsDraft.value = seed
    }
  })
}
