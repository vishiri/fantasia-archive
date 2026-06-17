import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplatePlacementDraft
} from 'app/types/I_dialogProjectSettingsWorlds'

export function collectDuplicateDocumentTemplateIdsInWorldTemplateLayout (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): Set<string> {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const placement of layout.placements) {
    const templateId = placement.documentTemplateId
    if (templateId.length === 0) {
      continue
    }
    if (seen.has(templateId)) {
      duplicates.add(templateId)
      continue
    }
    seen.add(templateId)
  }
  return duplicates
}

export function isDialogProjectSettingsWorldTemplatePlacementDuplicate (
  placement: I_dialogProjectSettingsWorldTemplatePlacementDraft,
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  if (placement.documentTemplateId.length === 0) {
    return false
  }
  return collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(layout)
    .has(placement.documentTemplateId)
}

export function hasDialogProjectSettingsWorldTemplateLayoutDuplicatePlacementError (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): boolean {
  return collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(layout).size > 0
}

export function collectBlankTemplateGroupIdsInWorldTemplateLayout (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): Set<string> {
  const blanks = new Set<string>()
  for (const group of layout.groups) {
    if (group.displayName.trim().length === 0) {
      blanks.add(group.id)
    }
  }
  return blanks
}

export function worldTemplateLayoutHasInvalidDocumentTemplatePlacements (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  invalidDocumentTemplateIds: ReadonlySet<string>
): boolean {
  if (invalidDocumentTemplateIds.size === 0) {
    return false
  }
  for (const placement of layout.placements) {
    if (invalidDocumentTemplateIds.has(placement.documentTemplateId)) {
      return true
    }
  }
  return false
}
