import type { I_dialogQuickAddDocumentTemplateSource } from 'app/types/I_dialogQuickAddDocument'
import type { I_dialogQuickAddDocumentWorldSource } from 'app/types/I_dialogQuickAddDocument'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'

import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

type T_dialogQuickAddDocumentSources = {
  templates: I_dialogQuickAddDocumentTemplateSource[]
  worlds: I_dialogQuickAddDocumentWorldSource[]
}

function emptyDialogQuickAddDocumentSources (): T_dialogQuickAddDocumentSources {
  const templates: I_dialogQuickAddDocumentTemplateSource[] = []
  const worlds: I_dialogQuickAddDocumentWorldSource[] = []
  return {
    templates,
    worlds
  }
}

function cloneDialogQuickAddDocumentTestingSources (
  testingSources: NonNullable<Window['__faComponentTestingQuickAddDocumentSources']>
): T_dialogQuickAddDocumentSources {
  const templates = testingSources.templates.map((template) => {
    return { ...template }
  })
  const worlds = testingSources.worlds.map((world) => {
    const groups = world.templateLayout.groups.map((group) => {
      return { ...group }
    })
    const placements = world.templateLayout.placements.map((placement) => {
      return { ...placement }
    })
    const templateLayout = {
      groups,
      placements
    }
    return {
      ...world,
      templateLayout
    }
  })
  return {
    templates,
    worlds
  }
}

/**
 * Loads worlds + document templates for Quick-Add Document option lists.
 * Component Playwright may seed window.__faComponentTestingQuickAddDocumentSources when
 * contextBridge freezes projectContent list methods (same frozen-bridge constraint as hierarchy tree).
 */
export async function loadDialogQuickAddDocumentSources (): Promise<T_dialogQuickAddDocumentSources> {
  const testingSources = window.__faComponentTestingQuickAddDocumentSources
  if (testingSources !== undefined) {
    return cloneDialogQuickAddDocumentTestingSources(testingSources)
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (
    typeof api?.listWorldsForProjectSettings !== 'function' ||
    typeof api?.listDocumentTemplatesForProjectSettings !== 'function'
  ) {
    return emptyDialogQuickAddDocumentSources()
  }
  const [worldsResult, templatesResult] = await Promise.all([
    api.listWorldsForProjectSettings(),
    api.listDocumentTemplatesForProjectSettings()
  ])
  const worlds: I_dialogQuickAddDocumentWorldSource[] = worldsResult.items.map((world) => ({
    color: world.color,
    displayNameTranslations: world.displayNameTranslations,
    id: world.id,
    sortOrder: world.sortOrder,
    templateLayout: {
      groups: world.templateLayout.groups.map((group) => ({
        id: group.id,
        rootSortOrder: group.rootSortOrder
      })),
      placements: world.templateLayout.placements.map((placement) => ({
        documentTemplateId: placement.documentTemplateId,
        groupId: placement.groupId,
        groupSortOrder: placement.groupSortOrder,
        rootSortOrder: placement.rootSortOrder
      }))
    }
  }))
  const templates: I_dialogQuickAddDocumentTemplateSource[] = templatesResult.items.map((template) => ({
    icon: resolveTrimmedIconOrDefault(template.icon, FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON),
    id: template.id,
    titlePluralTranslations: template.titlePluralTranslations,
    titleSingularTranslations: template.titleSingularTranslations
  }))
  return {
    templates,
    worlds
  }
}

/**
 * Preferred UI language for Quick-Add option labels and new-document display names.
 */
export function resolveDialogQuickAddDocumentPreferredLanguageCode (): T_faUserSettingsLanguageCode {
  return S_FaUserSettings().settings?.languageCode ?? 'en-US'
}
