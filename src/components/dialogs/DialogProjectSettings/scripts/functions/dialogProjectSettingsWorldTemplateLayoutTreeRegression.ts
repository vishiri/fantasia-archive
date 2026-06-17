import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

/**
 * True when reverse mapping moved a grouped placement to root without an explicit drag-end emit.
 * he-tree can echo stale flattened nodes after programmatic layout sync (for example Add group).
 */
export function hasDialogProjectSettingsWorldTemplateLayoutGroupedToRootRegression (
  priorLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  nextLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  for (const priorPlacement of priorLayout.placements) {
    if (priorPlacement.groupId === null) {
      continue
    }
    const nextPlacement = nextLayout.placements.find((placement) => {
      return placement.id === priorPlacement.id
    })
    if (nextPlacement === undefined) {
      continue
    }
    if (nextPlacement.groupId === null) {
      return true
    }
  }
  return false
}
