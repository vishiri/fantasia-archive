import { readFile, stat } from 'node:fs/promises'
import { Result, ResultAsync } from 'neverthrow'

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
  const statResult = await ResultAsync.fromPromise(
    stat(filePath),
    (e): unknown => e
  )
  if (statResult.isErr()) {
    const e = statResult.error
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

  const fstat = statResult.value

  if (fstat.size > FA_PROGRAM_CONFIG_MAX_FILE_BYTES) {
    return {
      errorMessage: 'File is larger than 3 MB',
      errorName: 'RangeError',
      outcome: 'error'
    }
  }

  const readResult = await ResultAsync.fromPromise(
    readFile(filePath),
    (e): unknown => e
  )
  if (readResult.isErr()) {
    const e = readResult.error
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

  const buf = readResult.value

  if (buf.length > FA_PROGRAM_CONFIG_MAX_FILE_BYTES) {
    return {
      errorMessage: 'File is larger than 3 MB',
      errorName: 'RangeError',
      outcome: 'error'
    }
  }

  const unzippedResult = Result.fromThrowable(
    (): ReturnType<typeof unzipProgramConfigBundle> => unzipProgramConfigBundle(new Uint8Array(buf)),
    (e): unknown => e
  )()

  if (unzippedResult.isErr()) {
    const e = unzippedResult.error
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[faProgramConfig] unzip failed', err)
    return {
      errorMessage: err.message,
      errorName: err.name,
      outcome: 'error'
    }
  }

  const unzipped = unzippedResult.value

  return tryStageImportFromUnzippedEntries(unzipped.entries)
}
