import { ResultAsync } from 'neverthrow'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import { i18n } from 'app/i18n/externalFileLoader'

function resolveProjectContentBridge (): {
  listDocumentTemplatesForProjectSettings?: () => Promise<{
    items: Array<{
      documentCount: number
      icon: string
      id: string
      titlePluralTranslations: I_dialogProjectSettingsDocumentTemplateDraft['titlePluralTranslations'],
      titleSingularTranslations: I_dialogProjectSettingsDocumentTemplateDraft['titleSingularTranslations']
      worldAppendixTranslations: I_dialogProjectSettingsDocumentTemplateDraft['worldAppendixTranslations']
    }>
  }>
  saveDocumentTemplatesSnapshot?: (items: I_faProjectDocumentTemplateSnapshotItem[]) => Promise<void>
} | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }
  return window.faContentBridgeAPIs?.projectContent
}

/**
 * Fresh IPC read of document templates for Project Settings (never Pinia cache alone).
 */
export async function faProjectDocumentTemplatesFetchFreshForDialog (): Promise<
  I_dialogProjectSettingsDocumentTemplateDraft[]
> {
  const api = resolveProjectContentBridge()
  if (typeof api?.listDocumentTemplatesForProjectSettings !== 'function') {
    throw new Error('projectContent.listDocumentTemplatesForProjectSettings is unavailable')
  }
  try {
    const result = await api.listDocumentTemplatesForProjectSettings()
    return result.items.map((template) => ({
      documentCount: template.documentCount,
      icon: template.icon,
      id: template.id,
      titlePluralTranslations: template.titlePluralTranslations,
      titleSingularTranslations: template.titleSingularTranslations,
      worldAppendixTranslations: template.worldAppendixTranslations
    }))
  } catch (error: unknown) {
    console.error('[Project Settings] listDocumentTemplatesForProjectSettings failed', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('listDocumentTemplatesForProjectSettings failed')
  }
}

/**
 * Persists the ordered document-templates snapshot from Project Settings save.
 */
export async function faProjectDocumentTemplatesPersistSnapshotFromDialog (
  items: I_faProjectDocumentTemplateSnapshotItem[]
): Promise<void> {
  const api = resolveProjectContentBridge()
  if (typeof api?.saveDocumentTemplatesSnapshot !== 'function') {
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.bridgeMissing'))
  }
  const writeResult = await ResultAsync.fromPromise(
    api.saveDocumentTemplatesSnapshot(items),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[Project Settings] saveDocumentTemplatesSnapshot failed', error)
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.saveError'))
  }
}
