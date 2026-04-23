import type { I_faProgramConfigImportPartsUi } from 'app/types/I_faProgramConfigDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

/**
 * In-memory import staging (validated payloads only) until the user applies or the session expires.
 */
export interface I_faStagedImportSession {
  data: {
    programSettings?: I_faUserSettings
    keybinds?: I_faKeybindsRoot
    programStyling?: I_faProgramStylingRoot
  }
  parts: I_faProgramConfigImportPartsUi
  expiresAt: number
}

export const faProgramConfigImportStagedSessions = new Map<string, I_faStagedImportSession>()

export function purgeFaProgramConfigStagedImportSessionsExpired (): void {
  const t = Date.now()
  for (const [k, s] of faProgramConfigImportStagedSessions.entries()) {
    if (s.expiresAt < t) {
      faProgramConfigImportStagedSessions.delete(k)
    }
  }
}

export function pathLooksLikeFaconfigFile (filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.faconfig')
}
