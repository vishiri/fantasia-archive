import type { I_faAppConfigImportPartsUi } from 'app/types/I_faAppConfigDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import type { T_faAppConfigInnerKey } from 'app/types/I_faAppConfigDomain'

/**
 * In-memory import staging (validated payloads only) until the user applies or the session expires.
 */
export interface I_faStagedImportSession {
  data: {
    keybinds?: I_faKeybindsRoot | undefined
    appNoteboard?: I_faAppNoteboardRoot | undefined
    appSettings?: I_faUserSettings | undefined
    appStyling?: I_faAppStylingRoot | undefined
  }
  parts: I_faAppConfigImportPartsUi
  expiresAt: number
}

/** Snapshots zipped into a '.faconfig' archive. */
export interface I_faAppConfigZipInputs {
  keybinds?: I_faKeybindsRoot | undefined
  appNoteboard?: I_faAppNoteboardRoot | undefined
  appStyling?: I_faAppStylingRoot | undefined
  userSettings?: I_faUserSettings | undefined
}

/** Parsed allowlisted entries from an app config unzip. */
export interface I_faAppConfigUnzipOk {
  entries: Partial<Record<T_faAppConfigInnerKey, string>>
}
