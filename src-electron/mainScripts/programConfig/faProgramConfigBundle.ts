import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

import {
  FA_PROGRAM_CONFIG_INNER,
  FA_PROGRAM_CONFIG_MAX_FILE_BYTES
} from 'app/src-electron/shared/faProgramConfigConstants'

import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

export interface I_faProgramConfigZipInputs {
  userSettings?: I_faUserSettings
  keybinds?: I_faKeybindsRoot
  programStyling?: I_faProgramStylingRoot
}

/**
 * Builds a '.faconfig' (zip) buffer from the given store snapshots.
 */
export function zipProgramConfigBundle (inputs: I_faProgramConfigZipInputs): Uint8Array {
  const files: Record<string, Uint8Array> = {}

  if (inputs.userSettings !== undefined) {
    files[FA_PROGRAM_CONFIG_INNER.userSettings] = strToU8(
      JSON.stringify(inputs.userSettings),
      false
    )
  }
  if (inputs.keybinds !== undefined) {
    files[FA_PROGRAM_CONFIG_INNER.keybinds] = strToU8(
      JSON.stringify(inputs.keybinds),
      false
    )
  }
  if (inputs.programStyling !== undefined) {
    files[FA_PROGRAM_CONFIG_INNER.programStyling] = strToU8(
      JSON.stringify(inputs.programStyling),
      false
    )
  }

  return zipSync(files, { level: 6 })
}

const ALLOWED_BASENAMES = new Set<string>(Object.values(FA_PROGRAM_CONFIG_INNER))

const BASENAME_TO_KEY: Record<string, keyof typeof FA_PROGRAM_CONFIG_INNER> = (() => {
  const out: Record<string, keyof typeof FA_PROGRAM_CONFIG_INNER> = {}
  for (const k of Object.keys(FA_PROGRAM_CONFIG_INNER) as Array<keyof typeof FA_PROGRAM_CONFIG_INNER>) {
    out[FA_PROGRAM_CONFIG_INNER[k]] = k
  }
  return out
})()

function basenamePosix (p: string): string {
  const i = p.lastIndexOf('/')
  return i === -1 ? p : p.slice(i + 1)
}

export interface I_faProgramConfigUnzipOk {
  entries: Partial<Record<keyof typeof FA_PROGRAM_CONFIG_INNER, string>>
}

/**
 * Unzips a buffer, keeps only allowlisted basenames, enforces per-entry and total size caps.
 * Returns UTF-8 text per key for JSON parsing in the caller.
 */
export function unzipProgramConfigBundle (buffer: Uint8Array): I_faProgramConfigUnzipOk {
  const flat = unzipSync(buffer, { filter: () => true })
  const entries: Partial<Record<keyof typeof FA_PROGRAM_CONFIG_INNER, string>> = {}
  let total = 0

  for (const [path, data] of Object.entries(flat)) {
    const base = basenamePosix(path)
    if (!ALLOWED_BASENAMES.has(base)) {
      continue
    }
    if (data.length > FA_PROGRAM_CONFIG_MAX_FILE_BYTES) {
      throw new Error(`faProgramConfig: entry too large: ${base}`)
    }
    total += data.length
    if (total > FA_PROGRAM_CONFIG_MAX_FILE_BYTES) {
      throw new Error('faProgramConfig: uncompressed total too large')
    }

    const key = BASENAME_TO_KEY[base]
    entries[key] = strFromU8(data, false)
  }

  return { entries }
}
