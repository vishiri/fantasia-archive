import { ResultAsync } from 'neverthrow'

import type {
  I_faProjectSettingsPatch,
  I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'
import { i18n } from 'app/i18n/externalFileLoader'
import { FaActionUserCanceledError } from 'app/src/scripts/actionManager/functions/faActionUserCanceledError'
import { propagateFaProjectSettingsToAppConsumers } from 'app/src/scripts/projectManagement/projectManagement_manager'

import { didObjectPatchPersist } from '../functions/faPersistPatchVerify'

async function assertFaProjectSettingsPersistEpoch (
  epochAtStart: number | undefined
): Promise<void> {
  if (epochAtStart === undefined) {
    return
  }
  const activeProjectModule = await import('app/src/stores/S_FaActiveProject')
  const activeProject = activeProjectModule.S_FaActiveProject()
  if (activeProject.isProjectReplacementInFlight()) {
    throw new FaActionUserCanceledError()
  }
  if (activeProject.readProjectContentEpoch() !== epochAtStart) {
    throw new FaActionUserCanceledError()
  }
}

/**
 * Hydrates canonical project settings from SQLite via the preload bridge.
 */
export async function faProjectSettingsRefreshFromBridge (opts: {
  applyRoot: (next: I_faProjectSettingsRoot) => void
}): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.getProjectSettings !== 'function') {
    return false
  }
  const activeProject = await import('app/src/stores/S_FaActiveProject')
  const epochAtStart = activeProject.S_FaActiveProject().readProjectContentEpoch()
  const readResult = await ResultAsync.fromPromise(
    api.getProjectSettings(),
    (error): unknown => error
  )
  if (activeProject.S_FaActiveProject().readProjectContentEpoch() !== epochAtStart) {
    return false
  }
  if (readResult.isErr()) {
    console.error('[S_FaProjectSettings] getProjectSettings failed', readResult.error)
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.loadError'))
  }
  opts.applyRoot(readResult.value)
  return true
}

/**
 * Fetches project settings for the Project Settings dialog local draft (always a fresh DB read).
 */
export async function faProjectSettingsFetchFreshForDialog (): Promise<I_faProjectSettingsRoot> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.getProjectSettings !== 'function') {
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.bridgeMissing'))
  }
  const readResult = await ResultAsync.fromPromise(
    api.getProjectSettings(),
    (error): unknown => error
  )
  if (readResult.isErr()) {
    const error = readResult.error
    console.error('[S_FaProjectSettings] getProjectSettings (dialog open) failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  return readResult.value
}

/**
 * Persists a validated patch, read-backs from SQLite, and propagates app consumers.
 */
export async function faProjectSettingsPersistPatchFromStore (opts: {
  applyRoot: (next: I_faProjectSettingsRoot) => void
  epochAtStart?: number
  patch: I_faProjectSettingsPatch
}): Promise<void> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (
    typeof api?.setProjectSettings !== 'function' ||
    typeof api?.getProjectSettings !== 'function'
  ) {
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.bridgeMissing'))
  }

  await assertFaProjectSettingsPersistEpoch(opts.epochAtStart)
  const writeResult = await ResultAsync.fromPromise(
    api.setProjectSettings(opts.patch),
    (error): unknown => error
  )
  if (writeResult.isErr()) {
    const error = writeResult.error
    console.error('[S_FaProjectSettings] setProjectSettings failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  if (!writeResult.value) {
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.saveError'))
  }

  await assertFaProjectSettingsPersistEpoch(opts.epochAtStart)
  const afterSaveResult = await ResultAsync.fromPromise(
    api.getProjectSettings(),
    (error): unknown => error
  )
  if (afterSaveResult.isErr()) {
    const error = afterSaveResult.error
    console.error('[S_FaProjectSettings] getProjectSettings after save failed', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
  const retrieved = afterSaveResult.value

  await assertFaProjectSettingsPersistEpoch(opts.epochAtStart)
  if (!didObjectPatchPersist(
    opts.patch as Partial<import('app/types/I_faProjectSettingsDomain').I_faProjectSettingsRoot>,
    retrieved
  )) {
    console.error(
      `[S_FaProjectSettings] ${i18n.global.t('globalFunctionality.faProjectSettings.saveMismatchLog')}`,
      {
        patch: opts.patch,
        retrievedSettings: retrieved
      }
    )
    throw new Error(i18n.global.t('globalFunctionality.faProjectSettings.saveError'))
  }

  opts.applyRoot(retrieved)
  propagateFaProjectSettingsToAppConsumers(retrieved)
}
