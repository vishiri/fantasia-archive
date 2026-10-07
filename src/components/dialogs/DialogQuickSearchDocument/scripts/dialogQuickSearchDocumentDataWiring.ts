import type { I_dialogQuickSearchDocumentDocumentSource } from 'app/types/I_dialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentTemplateIconSource } from 'app/types/I_dialogQuickSearchDocument'
import type { I_dialogQuickSearchDocumentWorldSource } from 'app/types/I_dialogQuickSearchDocument'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'

import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

function mapDialogQuickSearchDocumentSourceRow (document: {
  createdAtMs?: number
  displayName: string
  documentTextColor: string | null
  id: string
  isCategory: boolean
  sortOrder: number
  templateId: string | null
}): I_dialogQuickSearchDocumentDocumentSource {
  const row: I_dialogQuickSearchDocumentDocumentSource = {
    displayName: document.displayName,
    documentTextColor: document.documentTextColor,
    id: document.id,
    isCategory: document.isCategory,
    sortOrder: document.sortOrder,
    templateId: document.templateId
  }
  if (typeof document.createdAtMs === 'number') {
    row.createdAtMs = document.createdAtMs
  }
  return row
}

/**
 * Loads worlds + template icons for Quick-Search Document option lists.
 * Component Playwright may seed window.__faComponentTestingQuickSearchDocumentSources when
 * contextBridge freezes projectContent list methods.
 */
export async function loadDialogQuickSearchDocumentSources (): Promise<{
  templates: I_dialogQuickSearchDocumentTemplateIconSource[]
  worlds: I_dialogQuickSearchDocumentWorldSource[]
}> {
  const testingSources = window.__faComponentTestingQuickSearchDocumentSources
  if (testingSources !== undefined) {
    const templates = testingSources.templates.map((template) => {
      return { ...template }
    })
    const worlds = testingSources.worlds.map((world) => {
      return { ...world }
    })
    return {
      templates,
      worlds
    }
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (
    typeof api?.listWorldsForProjectSettings !== 'function' ||
    typeof api?.listDocumentTemplatesForProjectSettings !== 'function'
  ) {
    const templates: I_dialogQuickSearchDocumentTemplateIconSource[] = []
    const worlds: I_dialogQuickSearchDocumentWorldSource[] = []
    return {
      templates,
      worlds
    }
  }
  const [worldsResult, templatesResult] = await Promise.all([
    api.listWorldsForProjectSettings(),
    api.listDocumentTemplatesForProjectSettings()
  ])
  const worlds: I_dialogQuickSearchDocumentWorldSource[] = worldsResult.items.map((world) => ({
    color: world.color,
    displayNameTranslations: world.displayNameTranslations,
    id: world.id,
    sortOrder: world.sortOrder
  }))
  const templates: I_dialogQuickSearchDocumentTemplateIconSource[] = templatesResult.items.map(
    (template) => ({
      icon: resolveTrimmedIconOrDefault(template.icon, FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON),
      id: template.id
    })
  )
  return {
    templates,
    worlds
  }
}

/**
 * Loads documents for one world (categories included).
 */
export async function loadDialogQuickSearchDocumentDocumentsForWorld (
  worldId: string
): Promise<I_dialogQuickSearchDocumentDocumentSource[]> {
  const testingSources = window.__faComponentTestingQuickSearchDocumentSources
  if (testingSources !== undefined) {
    return testingSources.documents
      .filter((document) => document.worldId === worldId)
      .map((document) => mapDialogQuickSearchDocumentSourceRow(document))
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listDocuments !== 'function') {
    return []
  }
  const result = await api.listDocuments({ worldId })
  return result.items.map((document) => mapDialogQuickSearchDocumentSourceRow(document))
}

/**
 * Preferred UI language for Quick-Search world option labels.
 */
export function resolveDialogQuickSearchDocumentPreferredLanguageCode (): T_faUserSettingsLanguageCode {
  return S_FaUserSettings().settings?.languageCode ?? 'en-US'
}

/**
 * True when App Settings disableCloseAfterSelectQuickSearch is enabled
 * (stay open after select; open with middleBackground).
 */
export function readDialogQuickSearchDocumentDisableCloseAfterSelect (): boolean {
  return S_FaUserSettings().settings?.disableCloseAfterSelectQuickSearch === true
}
