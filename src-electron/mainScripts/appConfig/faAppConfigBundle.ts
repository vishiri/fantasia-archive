import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

import {
  FA_APP_CONFIG_INNER,
  FA_APP_CONFIG_MAX_FILE_BYTES
} from 'app/src-electron/shared/faAppConfigConstants'

import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

export interface I_faAppConfigZipInputs {
  keybinds?: I_faKeybindsRoot
  appNoteboard?: I_faAppNoteboardRoot
  appStyling?: I_faAppStylingRoot
  userSettings?: I_faUserSettings
}

/**
 * Builds a '.faconfig' (zip) buffer from the given store snapshots.
 */
export function zipAppConfigBundle (inputs: I_faAppConfigZipInputs): Uint8Array {
  const files: Record<string, Uint8Array> = {}

  if (inputs.keybinds !== undefined) {
    files[FA_APP_CONFIG_INNER.keybinds] = strToU8(
      JSON.stringify(inputs.keybinds),
      false
    )
  }
  if (inputs.appNoteboard !== undefined) {
    files[FA_APP_CONFIG_INNER.appNoteboard] = strToU8(
      JSON.stringify(inputs.appNoteboard),
      false
    )
  }
  if (inputs.appStyling !== undefined) {
    files[FA_APP_CONFIG_INNER.appStyling] = strToU8(
      JSON.stringify(inputs.appStyling),
      false
    )
  }
  if (inputs.userSettings !== undefined) {
    files[FA_APP_CONFIG_INNER.userSettings] = strToU8(
      JSON.stringify(inputs.userSettings),
      false
    )
  }

  return zipSync(files, { level: 6 })
}

const ALLOWED_BASENAMES = new Set<string>(Object.values(FA_APP_CONFIG_INNER))
function basenamePosix (p: string): string {
  const i = p.lastIndexOf('/')
  return i === -1 ? p : p.slice(i + 1)
}

export interface I_faAppConfigUnzipOk {
  entries: Partial<Record<keyof typeof FA_APP_CONFIG_INNER, string>>
}

/**
 * Unzips a buffer, keeps only allowlisted basenames, enforces per-entry and total size caps.
 * Returns UTF-8 text per key for JSON parsing in the caller.
 */
export function unzipAppConfigBundle (buffer: Uint8Array): I_faAppConfigUnzipOk {
  const flat = unzipSync(buffer, { filter: () => true })
  const textByBasename: Record<string, string> = {}
  let total = 0

  for (const [path, data] of Object.entries(flat)) {
    const base = basenamePosix(path)
    if (!ALLOWED_BASENAMES.has(base)) {
      continue
    }
    if (data.length > FA_APP_CONFIG_MAX_FILE_BYTES) {
      throw new Error(`faAppConfig: entry too large: ${base}`)
    }
    total += data.length
    if (total > FA_APP_CONFIG_MAX_FILE_BYTES) {
      throw new Error('faAppConfig: uncompressed total too large')
    }
    textByBasename[base] = strFromU8(data, false)
  }

  const entries: Partial<Record<keyof typeof FA_APP_CONFIG_INNER, string>> = {}
  for (const logicalKey of Object.keys(FA_APP_CONFIG_INNER) as Array<keyof typeof FA_APP_CONFIG_INNER>) {
    const canonicalBase = FA_APP_CONFIG_INNER[logicalKey]
    const text = textByBasename[canonicalBase]
    if (text !== undefined) {
      entries[logicalKey] = text
    }
  }

  return { entries }
}
