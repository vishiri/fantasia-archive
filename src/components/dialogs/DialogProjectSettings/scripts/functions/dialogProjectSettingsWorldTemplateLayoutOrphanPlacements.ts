import type { I_dialogProjectSettingsWorldTemplateLayoutDraft } from 'app/types/I_dialogProjectSettingsWorlds'

function mappedGroupIdSet (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): Set<string> {
  return new Set(layout.groups.map((group) => group.id))
}

function mappedPlacementIdSet (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): Set<string> {
  return new Set(layout.placements.map((placement) => placement.id))
}

function mappedDocumentTemplateIdSet (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): Set<string> {
  return new Set(layout.placements.map((placement) => placement.documentTemplateId))
}

/**
 * Re-appends prior orphan grouped placements missing from a drag commit map result.
 */
export function mergeOrphanPlacementsFromPriorWorldTemplateLayout (
  mapped: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  priorLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const groupIds = mappedGroupIdSet(mapped)
  const placementIds = mappedPlacementIdSet(mapped)
  const documentTemplateIds = mappedDocumentTemplateIdSet(mapped)
  const orphanPlacements = priorLayout.placements.filter((placement) => {
    if (placementIds.has(placement.id)) {
      return false
    }
    if (placement.groupId === null) {
      return false
    }
    if (groupIds.has(placement.groupId)) {
      return false
    }
    if (documentTemplateIds.has(placement.documentTemplateId)) {
      return false
    }
    return true
  })
  if (orphanPlacements.length === 0) {
    return mapped
  }
  return {
    groups: mapped.groups,
    placements: [
      ...mapped.placements,
      ...orphanPlacements
    ]
  }
}
