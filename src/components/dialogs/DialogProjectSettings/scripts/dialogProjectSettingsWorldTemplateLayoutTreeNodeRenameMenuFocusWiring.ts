import type { Ref } from 'vue'

import { shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus } from './functions/shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus'

export function clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus (
  nodeAnchorRef: Ref<HTMLElement | null>,
  options: {
    getOpenRenameMenuTargetKey: () => string | null
    getRenameMenuTargetKey: () => string | null
  }
): void {
  const anchor = nodeAnchorRef.value
  if (anchor !== null) {
    anchor.classList.remove('q-manual-focusable--focused')
    anchor.blur()
    const focusHelper = anchor.querySelector('.q-focus-helper')
    if (focusHelper instanceof HTMLElement) {
      focusHelper.blur()
    }
  }
  const shouldBlurActiveElement = shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus(
    options.getOpenRenameMenuTargetKey(),
    options.getRenameMenuTargetKey()
  )
  if (!shouldBlurActiveElement) {
    return
  }
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
