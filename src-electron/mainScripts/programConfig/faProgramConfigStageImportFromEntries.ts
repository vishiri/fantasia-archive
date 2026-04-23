import { v4 as uuidv4 } from 'uuid'

import type { I_faProgramConfigUnzipOk } from 'app/src-electron/mainScripts/programConfig/faProgramConfigBundle'
import { faProgramConfigImportStagedSessions } from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import type { I_faStagedImportSession } from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import { FA_PROGRAM_CONFIG_IMPORT_SESSION_TTL_MS } from 'app/src-electron/shared/faProgramConfigConstants'
import {
  parseFaKeybindsRootFile,
  parseFaProgramStylingRootFile,
  parseFaUserSettingsFile
} from 'app/src-electron/shared/faProgramConfigFileSchema'
import type { I_faProgramConfigImportPartsUi, I_faProgramConfigPrepareResult } from 'app/types/I_faProgramConfigDomain'

/**
 * Parses allowlisted JSON strings, stages a session, or returns a validation error result.
 */
export function tryStageImportFromUnzippedEntries (
  entries: I_faProgramConfigUnzipOk['entries']
): I_faProgramConfigPrepareResult {
  const usRaw = entries.userSettings
  const kbRaw = entries.keybinds
  const stRaw = entries.programStyling

  if (usRaw === undefined && kbRaw === undefined && stRaw === undefined) {
    return {
      errorName: 'FileError',
      errorMessage: 'The archive has no program settings, keybind, or program styling files',
      outcome: 'error'
    }
  }

  const data: I_faStagedImportSession['data'] = {}
  const parts: I_faProgramConfigImportPartsUi = {
    keybinds: 'absent',
    programSettings: 'absent',
    programStyling: 'absent'
  }

  try {
    if (usRaw !== undefined) {
      data.programSettings = parseFaUserSettingsFile(JSON.parse(usRaw) as unknown)
      parts.programSettings = 'ok'
    }
    if (kbRaw !== undefined) {
      data.keybinds = parseFaKeybindsRootFile(JSON.parse(kbRaw) as unknown)
      parts.keybinds = 'ok'
    }
    if (stRaw !== undefined) {
      data.programStyling = parseFaProgramStylingRootFile(JSON.parse(stRaw) as unknown)
      parts.programStyling = 'ok'
    }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] JSON or schema validation failed', {
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
  faProgramConfigImportStagedSessions.set(sessionId, {
    data,
    expiresAt: Date.now() + FA_PROGRAM_CONFIG_IMPORT_SESSION_TTL_MS,
    parts
  })
  return {
    outcome: 'ready',
    parts,
    sessionId
  }
}
