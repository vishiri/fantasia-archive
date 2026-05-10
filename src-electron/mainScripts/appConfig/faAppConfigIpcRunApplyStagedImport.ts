import { cleanupFaKeybinds, getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/faKeybindsStore'
import {
  faAppConfigImportStagedSessions,
  purgeFaAppConfigStagedImportSessionsExpired
} from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedState'
import {
  cleanupFaAppNoteboard,
  getFaAppNoteboard
} from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStore'
import { cleanupFaAppStyling, getFaAppStyling } from 'app/src-electron/mainScripts/appStyling/faAppStylingStore'
import { cleanupFaUserSettings, getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import { applyFaSpellCheckerLanguagesToSession } from 'app/src-electron/mainScripts/windowManagement/faSpellCheckerSession'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import type { I_faAppConfigApplyInput, I_faAppConfigApplyResult } from 'app/types/I_faAppConfigDomain'

/**
 * Writes staged JSON into 'electron-store' and runs the existing cleanup pass per domain.
 */
export function runApplyStagedAppConfigImport (p: I_faAppConfigApplyInput): I_faAppConfigApplyResult {
  purgeFaAppConfigStagedImportSessionsExpired()
  const {
    applyKeybinds,
    applyAppNoteboard,
    applyAppSettings,
    applyAppStyling,
    sessionId
  } = p
  if (!applyKeybinds && !applyAppNoteboard && !applyAppSettings && !applyAppStyling) {
    throw new RangeError('applyImport: at least one part must be selected')
  }

  const session = faAppConfigImportStagedSessions.get(sessionId)
  if (session === undefined || session.expiresAt < Date.now()) {
    faAppConfigImportStagedSessions.delete(sessionId)
    throw new Error('Import session has expired. Please choose the file again.')
  }

  const applied: I_faAppConfigApplyResult['appliedParts'] = []
  if (applyKeybinds && session.data.keybinds !== undefined) {
    const s = getFaKeybinds()
    s.store = { ...session.data.keybinds }
    cleanupFaKeybinds(s)
    applied.push('keybinds')
  }
  if (applyAppNoteboard && session.data.appNoteboard !== undefined) {
    const s = getFaAppNoteboard()
    s.store = { ...session.data.appNoteboard }
    cleanupFaAppNoteboard(s)
    applied.push('appNoteboard')
  }
  if (applyAppSettings && session.data.appSettings !== undefined) {
    const s = getFaUserSettings()
    s.store = { ...session.data.appSettings }
    cleanupFaUserSettings(s)
    if (appWindow !== undefined) {
      applyFaSpellCheckerLanguagesToSession(
        appWindow.webContents.session,
        s.store.languageCode
      )
    }
    applied.push('appSettings')
  }
  if (applyAppStyling && session.data.appStyling !== undefined) {
    const s = getFaAppStyling()
    s.store = { ...session.data.appStyling }
    cleanupFaAppStyling(s)
    applied.push('appStyling')
  }
  if (applied.length === 0) {
    throw new Error('No matching content for the selected import options')
  }
  faAppConfigImportStagedSessions.delete(sessionId)
  return { appliedParts: applied }
}
