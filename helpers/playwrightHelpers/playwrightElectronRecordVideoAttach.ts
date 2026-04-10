import fsPromises from 'node:fs/promises'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'

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
    try {
      await fsPromises.rm(dir, {
        force: true,
        recursive: true
      })
      return
    } catch (err) {
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
}

/**
 * Recursively attach '.webm' files under 'scanDir' so the HTML report lists them on this test.
 */
export async function attachWebmFilesUnderDir (
  testInfo: TestInfo,
  scanDir: string,
  namePrefix: string
): Promise<void> {
  let entries
  try {
    entries = await fsPromises.readdir(scanDir, { withFileTypes: true })
  } catch {
    return
  }

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
