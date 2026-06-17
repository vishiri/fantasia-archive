import type { Ref } from 'vue'

export function clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus (
  nodeAnchorRef: Ref<HTMLElement | null>
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
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}
