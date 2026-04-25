import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'
import type { ElectronApplication } from 'playwright'

import {
  attachWebmFilesUnderDir,
  removeRecordVideoTempDirBestEffort
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideoAttach'

export { installFaPlaywrightCursorMarkerIfVideoEnabled } from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideoCursor'

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

  const recordVideo = {
    dir: tempDir,
    size: {
      height: FA_PLAYWRIGHT_ELECTRON_VIDEO_HEIGHT,
      width: FA_PLAYWRIGHT_ELECTRON_VIDEO_WIDTH
    }
  }
  return {
    recordVideo
  }
}

/**
 * Close the Electron app (finalizes 'recordVideo' files), then register videos as test attachments for the HTML reporter.
 * Removes the temp 'recordVideo' directory after attaching. Skips attachment scan when 'FA_PLAYWRIGHT_NO_VIDEO' is set.
 *
 * For 'test.describe.serial' groups with more than one test, pass 'test.afterAll''s 'TestInfo' as 'htmlReportAttachTestInfo'.
 * Playwright's HTML report does not show attachments registered on 'beforeAll''s 'TestInfo' on each test's page; 'afterAll''s 'TestInfo' is attributed to the last test and shows the Videos section there.
 * When 'electronApp' is undefined (e.g. 'test.beforeAll' failed before 'electron.launch'), the call is a no-op so 'afterAll' does not add a spurious 'close' error.
 */
export async function closeFaElectronAppWithRecordedVideoAttachments (
  electronApp: ElectronApplication | undefined,
  recordVideoQueueTestInfo: TestInfo,
  htmlReportAttachTestInfo?: TestInfo
): Promise<void> {
  if (electronApp === undefined) {
    return
  }
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
