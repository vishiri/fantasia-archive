import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

const EMPTY_WORLD_TEMPLATE_LAYOUT: I_dialogProjectSettingsWorldDraft['templateLayout'] = {
  groups: [],
  placements: []
}

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
      displayName: world.displayName.trim(),
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
        rootSortOrder: placement.rootSortOrder
      }))
    }
    return item
  })
}

export function appendDialogProjectSettingsWorldDraft (
  worlds: I_dialogProjectSettingsWorldDraft[],
  defaultDisplayName: string
): I_dialogProjectSettingsWorldDraft[] {
  const id = crypto.randomUUID()
  return [
    ...worlds,
    {
      color: '',
      colorPallete: '',
      displayName: defaultDisplayName,
      documentCount: 0,
      id,
      templateLayout: EMPTY_WORLD_TEMPLATE_LAYOUT
    }
  ]
}

export function isDialogProjectSettingsWorldRemoveDisabled (
  worlds: I_dialogProjectSettingsWorldDraft[],
  world: I_dialogProjectSettingsWorldDraft
): boolean {
  if (worlds.length <= 1) {
    return true
  }
  return world.documentCount > 0
}
