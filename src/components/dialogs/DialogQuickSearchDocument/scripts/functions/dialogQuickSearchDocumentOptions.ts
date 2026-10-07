import type {
  I_dialogQuickSearchDocumentDocumentOption,
  I_dialogQuickSearchDocumentDocumentSource,
  I_dialogQuickSearchDocumentTemplateIconSource,
  I_dialogQuickSearchDocumentWorldOption,
  I_dialogQuickSearchDocumentWorldSource
} from 'app/types/I_dialogQuickSearchDocument'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/** Delay before focusing and opening the document q-select after dialog show (FA 1.0 ExistingDocument: nextTick + 100ms). */
export const FA_DIALOG_QUICK_SEARCH_DOCUMENT_FOCUS_MS = 100

/** World row glyph — same as hierarchy tree / Quick-add world indicator. */
export const FA_DIALOG_QUICK_SEARCH_DOCUMENT_WORLD_ICON = 'mdi-earth'

/** Category document glyph — same as hierarchy tree category nodes. */
export const FA_DIALOG_QUICK_SEARCH_DOCUMENT_CATEGORY_ICON = 'mdi-folder-open'

/** Fallback glyph when a document has no template icon. */
export const FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON = 'mdi-file-outline'

/**
 * Sorts world rows by Project Settings sortOrder ascending.
 * Equal sortOrder keeps the incoming list order (worlds query: created_at_ms, then id).
 */
export function sortDialogQuickSearchDocumentWorldsBySortOrder <
  T extends { id: string, sortOrder: number }
> (
  worlds: readonly T[]
): T[] {
  return [...worlds].sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Returns the id of the first world after sortOrder ascending, or null when empty.
 */
export function pickFirstDialogQuickSearchDocumentWorldId (
  worlds: readonly { id: string, sortOrder?: number }[]
): string | null {
  const withSort = worlds.map((world) => ({
    id: world.id,
    sortOrder: typeof world.sortOrder === 'number' ? world.sortOrder : 0
  }))
  const sorted = sortDialogQuickSearchDocumentWorldsBySortOrder(withSort)
  const first = sorted[0]
  if (first === undefined) {
    return null
  }
  return first.id
}

/**
 * Builds world FaSelectInput options from sorted world sources.
 */
export function buildDialogQuickSearchDocumentWorldOptions (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  resolveWorldLabel: (
    displayNameTranslations: I_dialogQuickSearchDocumentWorldSource['displayNameTranslations'],
    languageCode: T_faUserSettingsLanguageCode
  ) => string
  worlds: readonly I_dialogQuickSearchDocumentWorldSource[]
}): I_dialogQuickSearchDocumentWorldOption[] {
  const sorted = sortDialogQuickSearchDocumentWorldsBySortOrder(input.worlds)
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
      icon: FA_DIALOG_QUICK_SEARCH_DOCUMENT_WORLD_ICON,
      id,
      name
    }
  })
}

/**
 * Resolves the FaSelectInput icon for a document row (category folder or template icon).
 */
export function resolveDialogQuickSearchDocumentOptionIcon (
  document: I_dialogQuickSearchDocumentDocumentSource,
  templatesById: ReadonlyMap<string, I_dialogQuickSearchDocumentTemplateIconSource>
): string {
  if (document.isCategory) {
    return FA_DIALOG_QUICK_SEARCH_DOCUMENT_CATEGORY_ICON
  }
  const templateId = document.templateId
  if (templateId === null || templateId.length === 0) {
    return FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON
  }
  const template = templatesById.get(templateId)
  if (template === undefined || template.icon.trim().length === 0) {
    return FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON
  }
  return template.icon
}

/**
 * Builds document FaSelectInput options (categories included; name filter only at FaSelectInput).
 * Equal name and sortOrder keep older createdAtMs, then id.
 */
export function buildDialogQuickSearchDocumentDocumentOptions (input: {
  documents: readonly I_dialogQuickSearchDocumentDocumentSource[]
  resolveDocumentIcon: (
    document: I_dialogQuickSearchDocumentDocumentSource,
    templatesById: ReadonlyMap<string, I_dialogQuickSearchDocumentTemplateIconSource>
  ) => string
  templatesById: ReadonlyMap<string, I_dialogQuickSearchDocumentTemplateIconSource>
}): I_dialogQuickSearchDocumentDocumentOption[] {
  const sorted = [...input.documents].sort((left, right) => {
    const nameDelta = left.displayName.localeCompare(
      right.displayName,
      undefined,
      { sensitivity: 'accent' }
    )
    if (nameDelta !== 0) {
      return nameDelta
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }
    const createdAtDelta = (left.createdAtMs ?? 0) - (right.createdAtMs ?? 0)
    if (createdAtDelta !== 0) {
      return createdAtDelta
    }
    return left.id.localeCompare(right.id)
  })
  return sorted.map((document) => {
    const option: I_dialogQuickSearchDocumentDocumentOption = {
      icon: input.resolveDocumentIcon(document, input.templatesById),
      id: document.id,
      name: document.displayName.length > 0 ? document.displayName : document.id
    }
    const textColor = document.documentTextColor
    if (textColor !== null && textColor.trim().length > 0) {
      option.color = textColor
    }
    return option
  })
}
