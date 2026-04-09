import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'
import type { ElectronApplication, Page } from 'playwright'

/** Frame width for Playwright 'recordVideo.size' (1080p). */
export const FA_PLAYWRIGHT_ELECTRON_VIDEO_WIDTH = 1920

/** Frame height for Playwright 'recordVideo.size' (1080p). */
export const FA_PLAYWRIGHT_ELECTRON_VIDEO_HEIGHT = 1080

/**
 * FIFO queue of temp dirs used for 'recordVideo' for this test (one entry per 'getFaPlaywrightElectronRecordVideoPartial' call).
 * Keeping video outside 'testInfo.outputDir' avoids a duplicate 'page@….webm' next to 'attachments/' copies.
 */
const recordVideoTempDirQueues = new WeakMap<TestInfo, string[]>()

function takeNextRecordVideoTempDir (testInfo: TestInfo): string | undefined {
  const q = recordVideoTempDirQueues.get(testInfo)
  if (q === undefined || q.length === 0) {
    return undefined
  }
  const next = q.shift()
  if (q.length === 0) {
    recordVideoTempDirQueues.delete(testInfo)
  }
  return next
}

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
async function removeRecordVideoTempDirBestEffort (dir: string): Promise<void> {
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
 * Partial 'electron.launch' options to enable WebM screen recording for component and E2E tests.
 * Writes into a fresh directory under the OS temp folder (not 'testInfo.outputDir') so raw 'page@….webm' files are not stored next to Playwright's 'attachments/' copies.
 * If 'launchSegment' is set, still uses one temp dir per call (segment is only for future naming); multiple launches in one test use multiple 'getFaPlaywrightElectronRecordVideoPartial' calls.
 * Recordings use 1920x1080 frames (larger files than Playwright defaults).
 * Individual files may still be named 'page@<id>.webm' by Playwright.
 * Set env 'FA_PLAYWRIGHT_NO_VIDEO' to '1' or 'true' to skip recording (faster local runs).
 *
 * @param testInfo - Pass the same 'TestInfo' you will use as the queue key in 'closeFaElectronAppWithRecordedVideoAttachments' (typically 'test.beforeAll''s second argument). Queues the temp 'recordVideo' directory for that object.
 * @param _launchSegment - Reserved for future path disambiguation; each call still gets its own temp dir.
 */
/**
 * Injects a high z-index dot that follows pointer `clientX` / `clientY` in the renderer so WebM screen captures show where Playwright drives the mouse.
 * The OS cursor is often omitted from window-buffer video; synthetic `mousemove` events still update this marker.
 * No-op when `FA_PLAYWRIGHT_NO_VIDEO` is set, or when `FA_PLAYWRIGHT_CURSOR_MARKER` is `0` / `false`.
 *
 * @param page - Electron BrowserWindow page (first window from `electronApp.firstWindow()`).
 */
export async function installFaPlaywrightCursorMarkerIfVideoEnabled (page: Page): Promise<void> {
  if (
    process.env.FA_PLAYWRIGHT_NO_VIDEO === '1' ||
    process.env.FA_PLAYWRIGHT_NO_VIDEO === 'true'
  ) {
    return
  }
  if (
    process.env.FA_PLAYWRIGHT_CURSOR_MARKER === '0' ||
    process.env.FA_PLAYWRIGHT_CURSOR_MARKER === 'false'
  ) {
    return
  }

  await page.evaluate(() => {
    const existing = document.getElementById('fa-playwright-cursor-marker')
    if (existing !== null) {
      return
    }

    const dot = document.createElement('div')
    dot.id = 'fa-playwright-cursor-marker'
    dot.setAttribute('data-fa-playwright-cursor-marker', '')
    dot.style.cssText = [
      'position:fixed',
      'left:0',
      'top:0',
      'width:14px',
      'height:14px',
      'border-radius:50%',
      'background:rgba(255,68,68,0.92)',
      'border:2px solid #fff',
      'pointer-events:none',
      'z-index:2147483647',
      'transform:translate(-50%,-50%)',
      'box-shadow:0 0 6px rgba(0,0,0,0.55)',
      'opacity:0',
      'transition:opacity 80ms ease-out'
    ].join(';')
    document.body.appendChild(dot)

    const move = (clientX: number, clientY: number): void => {
      dot.style.left = `${clientX}px`
      dot.style.top = `${clientY}px`
      dot.style.opacity = '1'
    }

    document.addEventListener(
      'mousemove',
      (event: MouseEvent) => {
        move(event.clientX, event.clientY)
      },
      true
    )
  })
}

export function getFaPlaywrightElectronRecordVideoPartial (
  testInfo: TestInfo,
  _launchSegment?: string
): {
    recordVideo?: {
      dir: string
      size: {
        height: number
        width: number
      }
    }
  } {
  if (
    process.env.FA_PLAYWRIGHT_NO_VIDEO === '1' ||
    process.env.FA_PLAYWRIGHT_NO_VIDEO === 'true'
  ) {
    return {}
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-pw-vid-'))
  const q = recordVideoTempDirQueues.get(testInfo) ?? []
  q.push(tempDir)
  recordVideoTempDirQueues.set(testInfo, q)

  return {
    recordVideo: {
      dir: tempDir,
      size: {
        height: FA_PLAYWRIGHT_ELECTRON_VIDEO_HEIGHT,
        width: FA_PLAYWRIGHT_ELECTRON_VIDEO_WIDTH
      }
    }
  }
}

/**
 * Recursively attach '.webm' files under 'scanDir' so the HTML report lists them on this test.
 */
async function attachWebmFilesUnderDir (
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

/**
 * Close the Electron app (finalizes 'recordVideo' files), then register videos as test attachments for the HTML reporter.
 * Removes the temp 'recordVideo' directory after attaching. Skips attachment scan when 'FA_PLAYWRIGHT_NO_VIDEO' is set.
 *
 * For 'test.describe.serial' groups with more than one test, pass 'test.afterAll''s 'TestInfo' as 'htmlReportAttachTestInfo'.
 * Playwright's HTML report does not show attachments registered on 'beforeAll''s 'TestInfo' on each test's page; 'afterAll''s 'TestInfo' is attributed to the last test and shows the Videos section there.
 */
export async function closeFaElectronAppWithRecordedVideoAttachments (
  electronApp: ElectronApplication,
  recordVideoQueueTestInfo: TestInfo,
  htmlReportAttachTestInfo?: TestInfo
): Promise<void> {
  await electronApp.close()

  if (
    process.env.FA_PLAYWRIGHT_NO_VIDEO === '1' ||
    process.env.FA_PLAYWRIGHT_NO_VIDEO === 'true'
  ) {
    return
  }

  const attachTarget = htmlReportAttachTestInfo ?? recordVideoQueueTestInfo
  const tempDir = takeNextRecordVideoTempDir(recordVideoQueueTestInfo)
  if (tempDir !== undefined) {
    try {
      await attachWebmFilesUnderDir(attachTarget, tempDir, '')
    } finally {
      await removeRecordVideoTempDirBestEffort(tempDir)
    }
  }
}
