import fsPromises from 'node:fs/promises'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'
import { ResultAsync } from 'neverthrow'

function isWindowsTransientRmError (err: unknown): boolean {
  const code = err && typeof err === 'object' && 'code' in err
    ? (err as NodeJS.ErrnoException).code
    : undefined
  return code === 'EBUSY' || code === 'EPERM' || code === 'UNKNOWN'
}

/**
 * After UI-driven quit, Chromium can keep the WebM handle open briefly on Windows; 'EBUSY' on unlink is common.
 * Attachment copy is already under 'testInfo.outputDir/attachments/' before this runs.
 */
export async function removeRecordVideoTempDirBestEffort (dir: string): Promise<void> {
  const maxAttempts = 16
  const delayMs = 250
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rmResult = await ResultAsync.fromPromise(
      fsPromises.rm(dir, {
        force: true,
        recursive: true
      }),
      (err): unknown => err
    )
    if (rmResult.isOk()) {
      return
    }
    const err = rmResult.error
    if (attempt === maxAttempts - 1) {
      return
    }
    if (isWindowsTransientRmError(err)) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
      continue
    }
    return
  }
}

/**
 * Recursively attach '.webm' files under 'scanDir' so the HTML report lists them on this test.
 */
export async function attachWebmFilesUnderDir (
  testInfo: TestInfo,
  scanDir: string,
  namePrefix: string
): Promise<void> {
  const entriesResult = await ResultAsync.fromPromise(
    fsPromises.readdir(scanDir, { withFileTypes: true }),
    (): undefined => undefined
  )
  if (entriesResult.isErr()) {
    return
  }
  const entries = entriesResult.value

  for (const ent of entries) {
    const full = path.join(scanDir, ent.name)
    if (ent.isDirectory()) {
      await attachWebmFilesUnderDir(testInfo, full, `${namePrefix}${ent.name}/`)
    } else if (ent.name.endsWith('.webm')) {
      const attachName = `${namePrefix}${ent.name}`.replace(/^\/+/, '')
      await testInfo.attach(attachName, {
        contentType: 'video/webm',
        path: full
      })
    }
  }
}
