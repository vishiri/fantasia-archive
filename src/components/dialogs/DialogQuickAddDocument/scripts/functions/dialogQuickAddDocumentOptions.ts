import type {
  I_dialogQuickAddDocumentTemplateOption,
  I_dialogQuickAddDocumentTemplateSource,
  I_dialogQuickAddDocumentWorldOption,
  I_dialogQuickAddDocumentWorldSource
} from 'app/types/I_dialogQuickAddDocument'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/** Delay before focusing and opening the template q-select after dialog show (same 100ms as Quick Search). */
export const FA_DIALOG_QUICK_ADD_DOCUMENT_TEMPLATE_FOCUS_MS = 100

/** World row glyph — same as hierarchy tree / tab world indicator. */
export const FA_DIALOG_QUICK_ADD_DOCUMENT_WORLD_ICON = 'mdi-earth'

/**
 * Sorts world rows by Project Settings sortOrder ascending.
 * Equal sortOrder keeps the incoming list order (worlds query: created_at_ms, then id).
 */
export function sortDialogQuickAddDocumentWorldsBySortOrder (
  worlds: readonly I_dialogQuickAddDocumentWorldSource[]
): I_dialogQuickAddDocumentWorldSource[] {
  return [...worlds].sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Returns the id of the first world after sortOrder ascending, or null when empty.
 */
export function pickFirstDialogQuickAddDocumentWorldId (
  worlds: readonly { id: string, sortOrder?: number }[]
): string | null {
  const withSort: I_dialogQuickAddDocumentWorldSource[] = worlds.map((world) => ({
    color: '',
    displayNameTranslations: {},
    id: world.id,
    sortOrder: typeof world.sortOrder === 'number' ? world.sortOrder : 0,
    templateLayout: {
      groups: [],
      placements: []
    }
  }))
  const sorted = sortDialogQuickAddDocumentWorldsBySortOrder(withSort)
  const first = sorted[0]
  if (first === undefined) {
    return null
  }
  return first.id
}

/**
 * Unique documentTemplateId values from the selected world's template layout,
 * in hierarchy-tree visual order (rootSortOrder DFS; groups expand by groupSortOrder).
 */
export function collectDialogQuickAddDocumentTemplateIdsForWorld (
  world: I_dialogQuickAddDocumentWorldSource | null | undefined
): string[] {
  if (world === null || world === undefined) {
    return []
  }
  const { groups, placements } = world.templateLayout
  const rootItems: Array<
    | { kind: 'group', groupId: string, rootSortOrder: number }
    | { kind: 'placement', placementIndex: number, rootSortOrder: number }
  > = [
    ...groups.map((group) => ({
      groupId: group.id,
      kind: 'group' as const,
      rootSortOrder: group.rootSortOrder
    })),
    ...placements.flatMap((placement, placementIndex) => {
      if (placement.groupId !== null) {
        return []
      }
      return [{
        kind: 'placement' as const,
        placementIndex,
        rootSortOrder: placement.rootSortOrder ?? 0
      }]
    })
  ]
  rootItems.sort((left, right) => left.rootSortOrder - right.rootSortOrder)

  const seen = new Set<string>()
  const ids: string[] = []
  const pushTemplateId = (templateId: string): void => {
    if (templateId.length === 0 || seen.has(templateId)) {
      return
    }
    seen.add(templateId)
    ids.push(templateId)
  }

  for (const item of rootItems) {
    if (item.kind === 'placement') {
      const placement = placements[item.placementIndex]
      if (placement !== undefined) {
        pushTemplateId(placement.documentTemplateId)
      }
      continue
    }
    const grouped = placements
      .filter((placement) => placement.groupId === item.groupId)
      .sort((left, right) => (left.groupSortOrder ?? 0) - (right.groupSortOrder ?? 0))
    for (const placement of grouped) {
      pushTemplateId(placement.documentTemplateId)
    }
  }
  return ids
}

/**
 * Builds world FaSelectInput options from sorted world sources.
 */
export function buildDialogQuickAddDocumentWorldOptions (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  resolveWorldLabel: (
    displayNameTranslations: I_dialogQuickAddDocumentWorldSource['displayNameTranslations'],
    languageCode: T_faUserSettingsLanguageCode
  ) => string
  worlds: readonly I_dialogQuickAddDocumentWorldSource[]
}): I_dialogQuickAddDocumentWorldOption[] {
  const sorted = sortDialogQuickAddDocumentWorldsBySortOrder(input.worlds)
  return sorted.map((world) => {
    const label = input.resolveWorldLabel(
      world.displayNameTranslations,
      input.preferredLanguageCode
    )
    const color = world.color
    const id = world.id
    const name = label.length > 0 ? label : world.id
    return {
      color,
      icon: FA_DIALOG_QUICK_ADD_DOCUMENT_WORLD_ICON,
      id,
      name
    }
  })
}

/**
 * Builds template FaSelectInput options for the selected world.
 * Only templates mapped in that world's hierarchy layout (DFS order); no project-wide extras.
 */
export function buildDialogQuickAddDocumentTemplateOptions (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  resolveTemplateLabel: (
    template: I_dialogQuickAddDocumentTemplateSource,
    languageCode: T_faUserSettingsLanguageCode
  ) => string
  templatesById: ReadonlyMap<string, I_dialogQuickAddDocumentTemplateSource>
  world: I_dialogQuickAddDocumentWorldSource | null | undefined
}): I_dialogQuickAddDocumentTemplateOption[] {
  const placedIds = collectDialogQuickAddDocumentTemplateIdsForWorld(input.world)
  const options: I_dialogQuickAddDocumentTemplateOption[] = []
  for (const templateId of placedIds) {
    const template = input.templatesById.get(templateId)
    if (template === undefined) {
      continue
    }
    const label = input.resolveTemplateLabel(template, input.preferredLanguageCode)
    options.push({
      icon: template.icon,
      id: template.id,
      name: label.length > 0 ? label : template.id
    })
  }
  return options
}

/**
 * Finds a world source by id in a world list.
 */
export function findDialogQuickAddDocumentWorldById (
  worlds: readonly I_dialogQuickAddDocumentWorldSource[],
  worldId: string | null
): I_dialogQuickAddDocumentWorldSource | null {
  if (worldId === null || worldId.length === 0) {
    return null
  }
  const match = worlds.find((world) => world.id === worldId)
  return match ?? null
}
