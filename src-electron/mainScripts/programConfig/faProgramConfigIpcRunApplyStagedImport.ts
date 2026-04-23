import { cleanupFaKeybinds, getFaKeybinds } from 'app/src-electron/mainScripts/keybinds/faKeybindsStore'
import {
  faProgramConfigImportStagedSessions,
  purgeFaProgramConfigStagedImportSessionsExpired
} from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import { cleanupFaProgramStyling, getFaProgramStyling } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStore'
import { cleanupFaUserSettings, getFaUserSettings } from 'app/src-electron/mainScripts/userSettings/userSettingsStore'
import { applyFaSpellCheckerLanguagesToSession } from 'app/src-electron/mainScripts/windowManagement/faSpellCheckerSession'
import { appWindow } from 'app/src-electron/mainScripts/windowManagement/mainWindowCreation'
import type { I_faProgramConfigApplyInput, I_faProgramConfigApplyResult } from 'app/types/I_faProgramConfigDomain'

/**
 * Writes staged JSON into 'electron-store' and runs the existing cleanup pass per domain.
 */
export function runApplyStagedProgramConfigImport (p: I_faProgramConfigApplyInput): I_faProgramConfigApplyResult {
  purgeFaProgramConfigStagedImportSessionsExpired()
  const { sessionId, applyProgramSettings, applyKeybinds, applyProgramStyling } = p
  if (!applyProgramSettings && !applyKeybinds && !applyProgramStyling) {
    throw new RangeError('applyImport: at least one part must be selected')
  }

  const session = faProgramConfigImportStagedSessions.get(sessionId)
  if (session === undefined || session.expiresAt < Date.now()) {
    faProgramConfigImportStagedSessions.delete(sessionId)
    throw new Error('Import session has expired. Please choose the file again.')
  }

  const applied: I_faProgramConfigApplyResult['appliedParts'] = []
  if (applyProgramSettings && session.data.programSettings !== undefined) {
    const s = getFaUserSettings()
    s.store = { ...session.data.programSettings }
    cleanupFaUserSettings(s)
    if (appWindow !== undefined) {
      applyFaSpellCheckerLanguagesToSession(
        appWindow.webContents.session,
        s.store.languageCode
      )
    }
    applied.push('programSettings')
  }
  if (applyKeybinds && session.data.keybinds !== undefined) {
    const s = getFaKeybinds()
    s.store = { ...session.data.keybinds }
    cleanupFaKeybinds(s)
    applied.push('keybinds')
  }
  if (applyProgramStyling && session.data.programStyling !== undefined) {
    const s = getFaProgramStyling()
    s.store = { ...session.data.programStyling }
    cleanupFaProgramStyling(s)
    applied.push('programStyling')
  }
  if (applied.length === 0) {
    throw new Error('No matching content for the selected import options')
  }
  faProgramConfigImportStagedSessions.delete(sessionId)
  return { appliedParts: applied }
}
