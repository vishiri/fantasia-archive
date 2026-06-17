import { ResultAsync } from 'neverthrow'

import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import {
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft,
  mapDialogProjectSettingsWorldTemplateLayoutFromApi
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsWorldTemplateLayoutDraft'

/**
 * Loads worlds and per-world document counts for the Project Settings dialog.
 */
export async function faProjectWorldsFetchFreshForDialog (): Promise<I_dialogProjectSettingsWorldDraft[]> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.listWorldsForProjectSettings !== 'function') {
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.bridgeMissing'))
  }
  const readResult = await ResultAsync.fromPromise(
    api.listWorldsForProjectSettings(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    const error = readResult.error
    console.error('[Project Settings] listWorldsForProjectSettings failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  return readResult.value.items.map((world) => ({
    color: world.color,
    colorPallete: world.colorPallete,
    displayName: world.displayName,
    documentCount: world.documentCount,
    id: world.id,
    templateLayout: world.templateLayout !== undefined
      ? mapDialogProjectSettingsWorldTemplateLayoutFromApi(world.templateLayout)
      : createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  }))
}

/**
 * Persists the ordered worlds snapshot from Project Settings save.
 */
export async function faProjectWorldsPersistSnapshotFromDialog (
  items: I_faProjectWorldSnapshotItem[]
): Promise<void> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.saveWorldsSnapshot !== 'function') {
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.bridgeMissing'))
  }
  const writeResult = await ResultAsync.fromPromise(
    api.saveWorldsSnapshot(items),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[Project Settings] saveWorldsSnapshot failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}
