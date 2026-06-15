import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'

function resolveProjectContentBridge (): {
  listDocumentTemplatesForProjectSettings?: () => Promise<{
    items: Array<{
      displayName: string
      documentCount: number
      icon: string
      id: string
      worldAppendix: string
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
      displayName: template.displayName,
      documentCount: template.documentCount,
      icon: template.icon,
      id: template.id,
      worldAppendix: template.worldAppendix
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
    throw new Error('projectContent.saveDocumentTemplatesSnapshot is unavailable')
  }
  try {
    await api.saveDocumentTemplatesSnapshot(items)
  } catch (error: unknown) {
    console.error('[Project Settings] saveDocumentTemplatesSnapshot failed', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('saveDocumentTemplatesSnapshot failed')
  }
}
