/**
 * Rename-menu width for a tree row: anchor left edge to actions column minus trailing padding.
 * When actionsLeftPx is set, uses live layout; otherwise falls back to token button sizes.
 */
export function resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx (params: {
  actionButtonSizePx: number
  actionButtonsCount: number
  actionButtonsGapPx: number
  actionsPaddingPx: number
  anchor: {
    anchorClientWidth: number
    anchorLeftPx: number
    actionsLeftPx: number | null
  }
}): number {
  if (params.anchor.actionsLeftPx !== null) {
    return Math.max(
      0,
      Math.round(params.anchor.actionsLeftPx - params.anchor.anchorLeftPx - params.actionsPaddingPx)
    )
  }
  const actionsWidth =
    params.actionButtonSizePx * params.actionButtonsCount + params.actionButtonsGapPx
  return Math.max(0, params.anchor.anchorClientWidth - actionsWidth - params.actionsPaddingPx)
}
