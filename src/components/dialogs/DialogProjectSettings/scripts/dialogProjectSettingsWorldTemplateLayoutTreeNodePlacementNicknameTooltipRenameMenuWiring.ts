import type { ComputedRef, WritableComputedRef } from 'vue'

import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'

type T_actionTooltipsWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring>

export function wireDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenu (params: {
  actionTooltipsWiring: T_actionTooltipsWiring
  renameMenuOpen: ComputedRef<boolean> | WritableComputedRef<boolean>
  watch: typeof import('vue').watch
}): void {
  params.watch(() => params.renameMenuOpen.value, (open) => {
    if (open) {
      params.actionTooltipsWiring.suppressPlacementNicknameHoverTooltip()
      return
    }
    params.actionTooltipsWiring.armPlacementNicknameHoverTooltip()
  }, { flush: 'sync' })
}
