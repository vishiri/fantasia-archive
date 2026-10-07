import { getActivePinia } from 'pinia'
import { ResultAsync } from 'neverthrow'

import type {
  T_faProjectDialogUiPrefKey
} from 'app/types/I_faProjectDialogUiPrefDomain'
import { FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID } from 'app/types/I_faProjectDialogUiPrefDomain'

/**
 * Reads one allowlisted dialog UI preference from the active project (best-effort).
 */
export async function readFaProjectDialogUiPrefFromBridge (
  key: T_faProjectDialogUiPrefKey
): Promise<string | null> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.getProjectDialogUiPref !== 'function') {
    return null
  }
  const result = await ResultAsync.fromPromise(
    api.getProjectDialogUiPref({ key }),
    (error) => error
  )
  if (result.isErr()) {
    console.error('[projectDialogUiPref] getProjectDialogUiPref failed', result.error)
    return null
  }
  return result.value.value
}

async function dialogUiPrefWriteBlockedByProjectReplacement (): Promise<boolean> {
  if (getActivePinia() === undefined) {
    return false
  }
  const activeProjectModule = await import('app/src/stores/S_FaActiveProject')
  return activeProjectModule.S_FaActiveProject().isProjectReplacementInFlight()
}

/**
 * Writes one allowlisted dialog UI preference (best-effort; does not throw to callers).
 */
export async function writeFaProjectDialogUiPrefViaBridge (
  key: T_faProjectDialogUiPrefKey,
  value: string
): Promise<void> {
  const api = window.faContentBridgeAPIs?.projectManagement
  if (typeof api?.setProjectDialogUiPref !== 'function') {
    return
  }
  if (await dialogUiPrefWriteBlockedByProjectReplacement()) {
    return
  }
  const result = await ResultAsync.fromPromise(
    api.setProjectDialogUiPref({
      key,
      value
    }),
    (error) => error
  )
  if (result.isErr()) {
    console.error('[projectDialogUiPref] setProjectDialogUiPref failed', result.error)
  }
}

/**
 * Reads shared last-selected world id for Quick-add / Quick-search.
 */
export async function readFaProjectLastSelectedWorldId (): Promise<string | null> {
  return await readFaProjectDialogUiPrefFromBridge(
    FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID
  )
}

let lastSelectedWorldWriteTail: Promise<void> = Promise.resolve()

/**
 * Persists shared last-selected world id for Quick-add / Quick-search.
 * Overlapping picks run in order so an older write cannot finish last.
 */
export async function writeFaProjectLastSelectedWorldId (
  worldId: string
): Promise<void> {
  const run = lastSelectedWorldWriteTail.then(() => {
    return writeFaProjectDialogUiPrefViaBridge(
      FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
      worldId
    )
  })
  lastSelectedWorldWriteTail = run.then(() => undefined, () => undefined)
  await run
}
