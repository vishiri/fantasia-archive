import { v4 as uuidv4 } from 'uuid'
import { Result } from 'neverthrow'

import { faAppConfigImportStagedSessions } from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedState'
import type {
  I_faAppConfigUnzipOk,
  I_faStagedImportSession
} from 'app/types/I_faAppConfigElectronMain'
import { FA_APP_CONFIG_IMPORT_SESSION_TTL_MS } from 'app/src-electron/shared/faAppConfigConstants'
import {
  parseFaKeybindsRootFile,
  parseFaAppNoteboardRootFile,
  parseFaAppStylingRootFile,
  parseFaUserSettingsFile
} from 'app/src-electron/shared/faAppConfigFileSchema'
import type { I_faAppConfigImportPartsUi, I_faAppConfigPrepareResult } from 'app/types/I_faAppConfigDomain'

/**
 * Parses allowlisted JSON strings, stages a session, or returns a validation error result.
 */
export function tryStageAppImportFromUnzippedEntries (
  entries: I_faAppConfigUnzipOk['entries']
): I_faAppConfigPrepareResult {
  const usRaw = entries.userSettings
  const kbRaw = entries.keybinds
  const nbRaw = entries.appNoteboard
  const stRaw = entries.appStyling

  if (usRaw === undefined && kbRaw === undefined && nbRaw === undefined && stRaw === undefined) {
    return {
      errorName: 'FileError',
      errorMessage: 'The archive has no app settings, keybind, noteboard, or app styling files',
      outcome: 'error'
    }
  }

  const data: I_faStagedImportSession['data'] = {}
  const parts: I_faAppConfigImportPartsUi = {
    keybinds: 'absent',
    appNoteboard: 'absent',
    appSettings: 'absent',
    appStyling: 'absent'
  }

  const parseResult = Result.fromThrowable((): void => {
    if (usRaw !== undefined) {
      data.appSettings = parseFaUserSettingsFile(JSON.parse(usRaw) as unknown)
      parts.appSettings = 'ok'
    }
    if (kbRaw !== undefined) {
      data.keybinds = parseFaKeybindsRootFile(JSON.parse(kbRaw) as unknown)
      parts.keybinds = 'ok'
    }
    if (nbRaw !== undefined) {
      data.appNoteboard = parseFaAppNoteboardRootFile(JSON.parse(nbRaw) as unknown)
      parts.appNoteboard = 'ok'
    }
    if (stRaw !== undefined) {
      data.appStyling = parseFaAppStylingRootFile(JSON.parse(stRaw) as unknown)
      parts.appStyling = 'ok'
    }
  }, (e): unknown => e)()

  if (parseResult.isErr()) {
    const e = parseResult.error
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faAppConfig] JSON or schema validation failed', {
      message: err.message,
      name: err.name
    })
    return {
      errorName: 'ValidationError',
      errorMessage: 'Invalid or unsupported JSON in the configuration file',
      outcome: 'error'
    }
  }

  const sessionId = uuidv4()
  faAppConfigImportStagedSessions.set(sessionId, {
    data,
    expiresAt: Date.now() + FA_APP_CONFIG_IMPORT_SESSION_TTL_MS,
    parts
  })
  return {
    outcome: 'ready',
    parts,
    sessionId
  }
}
