import { readFile, stat } from 'node:fs/promises'

import { unzipProgramConfigBundle } from 'app/src-electron/mainScripts/programConfig/faProgramConfigBundle'
import { tryStageImportFromUnzippedEntries } from 'app/src-electron/mainScripts/programConfig/faProgramConfigStageImportFromEntries'
import { FA_PROGRAM_CONFIG_MAX_FILE_BYTES } from 'app/src-electron/shared/faProgramConfigConstants'
import type { I_faProgramConfigPrepareResult } from 'app/types/I_faProgramConfigDomain'

/**
 * Reads a .faconfig from disk, validates, and stages a session for a later apply.
 */
export async function runPrepareImportFromFaconfigFilePath (
  filePath: string
): Promise<I_faProgramConfigPrepareResult> {
  let fstat: Awaited<ReturnType<typeof stat>>
  try {
    fstat = await stat(filePath)
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] stat failed', {
      err,
      filePath
    })
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }
  if (fstat.size > FA_PROGRAM_CONFIG_MAX_FILE_BYTES) {
    return {
      errorMessage: 'File is larger than 3 MB',
      errorName: 'RangeError',
      outcome: 'error'
    }
  }

  let buf: Buffer
  try {
    buf = await readFile(filePath)
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] readFile failed', {
      err,
      filePath
    })
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }
  if (buf.length > FA_PROGRAM_CONFIG_MAX_FILE_BYTES) {
    return {
      errorMessage: 'File is larger than 3 MB',
      errorName: 'RangeError',
      outcome: 'error'
    }
  }

  let unzipped: ReturnType<typeof unzipProgramConfigBundle>
  try {
    unzipped = unzipProgramConfigBundle(new Uint8Array(buf))
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] unzip failed', err)
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  return tryStageImportFromUnzippedEntries(unzipped.entries)
}
