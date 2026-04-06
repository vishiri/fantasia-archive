import fs from 'node:fs'

import type { TestInfo } from '@playwright/test'
import {
  afterEach,
  expect,
  test,
  vi
} from 'vitest'

import {
  FA_PLAYWRIGHT_ELECTRON_VIDEO_HEIGHT,
  FA_PLAYWRIGHT_ELECTRON_VIDEO_WIDTH,
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from '../playwrightElectronRecordVideo'

afterEach(() => {
  vi.unstubAllEnvs()
})

/**
 * getFaPlaywrightElectronRecordVideoPartial
 * Returns no recordVideo options when FA_PLAYWRIGHT_NO_VIDEO is set so local runs can skip disk and encoding cost.
 */
test('getFaPlaywrightElectronRecordVideoPartial returns empty partial when FA_PLAYWRIGHT_NO_VIDEO is 1', () => {
  vi.stubEnv('FA_PLAYWRIGHT_NO_VIDEO', '1')
  const partial = getFaPlaywrightElectronRecordVideoPartial({} as TestInfo)
  expect(partial).toEqual({})
})

/**
 * getFaPlaywrightElectronRecordVideoPartial
 * Uses fixed 1080p dimensions and a fresh temp directory under the OS temp folder.
 */
test('getFaPlaywrightElectronRecordVideoPartial returns recordVideo size and an existing temp dir', () => {
  const partial = getFaPlaywrightElectronRecordVideoPartial({} as TestInfo)
  expect(partial.recordVideo).toBeDefined()
  expect(partial.recordVideo?.size).toEqual({
    height: FA_PLAYWRIGHT_ELECTRON_VIDEO_HEIGHT,
    width: FA_PLAYWRIGHT_ELECTRON_VIDEO_WIDTH
  })
  expect(partial.recordVideo?.dir).toMatch(/fa-pw-vid-/)
  expect(fs.existsSync(partial.recordVideo!.dir)).toBe(true)
  fs.rmSync(partial.recordVideo!.dir, {
    force: true,
    recursive: true
  })
})

/**
 * getFaPlaywrightElectronRecordVideoPartial
 * Multiple calls for the same TestInfo instance queue distinct temp dirs for multi-launch tests.
 */
test('getFaPlaywrightElectronRecordVideoPartial allocates separate temp dirs per call for one TestInfo', () => {
  const testInfo = {} as TestInfo
  const first = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const second = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  expect(first.recordVideo?.dir).toBeDefined()
  expect(second.recordVideo?.dir).toBeDefined()
  expect(first.recordVideo?.dir).not.toBe(second.recordVideo?.dir)
  fs.rmSync(first.recordVideo!.dir, {
    force: true,
    recursive: true
  })
  fs.rmSync(second.recordVideo!.dir, {
    force: true,
    recursive: true
  })
})

/**
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * Skips DOM injection when screen video is disabled via env.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled does not call page.evaluate when FA_PLAYWRIGHT_NO_VIDEO is true', async () => {
  vi.stubEnv('FA_PLAYWRIGHT_NO_VIDEO', 'true')
  const evaluate = vi.fn()
  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate
  } as never)
  expect(evaluate).not.toHaveBeenCalled()
})

/**
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * Skips DOM injection when the synthetic cursor overlay is turned off.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled does not call page.evaluate when FA_PLAYWRIGHT_CURSOR_MARKER is false', async () => {
  vi.stubEnv('FA_PLAYWRIGHT_CURSOR_MARKER', 'false')
  const evaluate = vi.fn()
  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate
  } as never)
  expect(evaluate).not.toHaveBeenCalled()
})

/**
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * Injects the marker script in the renderer when video and cursor marker are allowed.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled calls page.evaluate once when video and marker are enabled', async () => {
  const evaluate = vi.fn().mockResolvedValue(undefined)
  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate
  } as never)
  expect(evaluate).toHaveBeenCalledTimes(1)
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Always closes the Electron application even when video capture is disabled.
 */
test('closeFaElectronAppWithRecordedVideoAttachments invokes electronApp.close when FA_PLAYWRIGHT_NO_VIDEO is set', async () => {
  vi.stubEnv('FA_PLAYWRIGHT_NO_VIDEO', '1')
  const close = vi.fn().mockResolvedValue(undefined)
  await closeFaElectronAppWithRecordedVideoAttachments({
    close
  } as never, {} as TestInfo)
  expect(close).toHaveBeenCalledTimes(1)
})
