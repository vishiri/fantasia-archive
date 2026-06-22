import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

import { normalizeFaProjectWorldDisplayNameTranslations } from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'

const HEX_COLOR_SEGMENT = /^#[0-9a-fA-F]{6}$/

function normalizeDialogProjectSettingsColorPallete (colorPallete: string): string {
  const trimmed = colorPallete.trim()
  if (trimmed.length === 0) {
    return ''
  }
  const seen = new Set<string>()
  const normalized: string[] = []
  for (const segment of trimmed.split(';')) {
    const part = segment.trim()
    if (part.length === 0) {
      continue
    }
    if (!HEX_COLOR_SEGMENT.test(part)) {
      continue
    }
    const upper = part.toUpperCase()
    const key = upper.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    normalized.push(upper)
  }
  return normalized.join(';')
}

export function mapDialogProjectSettingsWorldsToSnapshot (
  worlds: I_dialogProjectSettingsWorldDraft[]
): I_faProjectWorldSnapshotItem[] {
  return worlds.map((world) => {
    const trimmedColor = world.color.trim()
    const item: I_faProjectWorldSnapshotItem = {
      displayNameTranslations: normalizeFaProjectWorldDisplayNameTranslations(
        world.displayNameTranslations
      ),
      id: world.id
    }
    if (trimmedColor.length > 0) {
      item.color = trimmedColor
    }
    const normalizedPallete = normalizeDialogProjectSettingsColorPallete(world.colorPallete)
    if (normalizedPallete.length > 0) {
      item.colorPallete = normalizedPallete
    }
    item.templateLayout = {
      groups: world.templateLayout.groups.map((group) => ({
        displayName: group.displayName.trim(),
        id: group.id,
        rootSortOrder: group.rootSortOrder
      })),
      placements: world.templateLayout.placements.map((placement) => ({
        documentTemplateId: placement.documentTemplateId,
        groupId: placement.groupId,
        groupSortOrder: placement.groupSortOrder,
        id: placement.id,
        nickname: placement.nickname.trim(),
        rootSortOrder: placement.rootSortOrder
      }))
    }
    return item
  })
}
