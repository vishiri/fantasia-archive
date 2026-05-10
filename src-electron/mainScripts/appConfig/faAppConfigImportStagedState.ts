import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

/**
 * In-memory import staging (validated payloads only) until the user applies or the session expires.
 */
export interface I_faStagedImportSession {
  data: {
    keybinds?: I_faKeybindsRoot
    appNoteboard?: I_faAppNoteboardRoot
    appSettings?: I_faUserSettings
    appStyling?: I_faAppStylingRoot
  }
  parts: I_faAppConfigImportPartsUi
  expiresAt: number
}

export const faAppConfigImportStagedSessions = new Map<string, I_faStagedImportSession>()

export function purgeFaAppConfigStagedImportSessionsExpired (): void {
  const t = Date.now()
  for (const [k, s] of faAppConfigImportStagedSessions.entries()) {
    if (s.expiresAt < t) {
      faAppConfigImportStagedSessions.delete(k)
    }
  }
}

export function pathLooksLikeFaconfigFile (filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.faconfig')
}
