/**
 * Returns whether hiding this row's rename menu should blur document.activeElement.
 * Skip when another row's rename menu is already the shared open target.
 */
export function shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus (
  openRenameMenuTargetKey: string | null,
  thisNodeRenameMenuTargetKey: string | null
): boolean {
  if (openRenameMenuTargetKey === null) {
    return true
  }
  return openRenameMenuTargetKey === thisNodeRenameMenuTargetKey
}
