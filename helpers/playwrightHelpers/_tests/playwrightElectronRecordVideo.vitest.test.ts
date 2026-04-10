/** @vitest-environment jsdom */

import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'
import {
  afterEach,
  beforeEach,
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

beforeEach(() => {
  vi.useRealTimers()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
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
 * Treats the string 'true' like '1' for disabling recordVideo options.
 */
test('getFaPlaywrightElectronRecordVideoPartial returns empty partial when FA_PLAYWRIGHT_NO_VIDEO is true', () => {
  vi.stubEnv('FA_PLAYWRIGHT_NO_VIDEO', 'true')
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
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * Invoking the function passed to evaluate inserts the cursor marker element into document.body.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled evaluate callback creates the cursor marker in the DOM', async () => {
  document.body.replaceChildren()

  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate: async (fn: () => void) => {
      fn()
    }
  } as never)

  expect(document.getElementById('fa-playwright-cursor-marker')).not.toBe(null)
})

/**
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * Second install leaves the first marker in place and returns early inside page.evaluate.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled evaluate callback is a no-op when the marker already exists', async () => {
  document.body.replaceChildren()
  const evaluate = vi.fn().mockImplementation(async (fn: () => void) => {
    fn()
  })

  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate
  } as never)
  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate
  } as never)

  expect(evaluate).toHaveBeenCalledTimes(2)
  expect(document.querySelectorAll('#fa-playwright-cursor-marker')).toHaveLength(1)
})

/**
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * The injected listener updates dot position from mousemove client coordinates.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled wires mousemove to move the marker dot', async () => {
  document.body.replaceChildren()

  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate: async (fn: () => void) => {
      fn()
    }
  } as never)

  const dot = document.getElementById('fa-playwright-cursor-marker')
  expect(dot).not.toBe(null)
  document.dispatchEvent(
    new MouseEvent('mousemove', {
      bubbles: true,
      clientX: 42,
      clientY: 77
    })
  )
  expect(dot?.style.left).toBe('42px')
  expect(dot?.style.top).toBe('77px')
  expect(dot?.style.opacity).toBe('1')
})

/**
 * installFaPlaywrightCursorMarkerIfVideoEnabled
 * Skips DOM injection when FA_PLAYWRIGHT_CURSOR_MARKER is zero.
 */
test('installFaPlaywrightCursorMarkerIfVideoEnabled does not call page.evaluate when FA_PLAYWRIGHT_CURSOR_MARKER is 0', async () => {
  vi.stubEnv('FA_PLAYWRIGHT_CURSOR_MARKER', '0')
  const evaluate = vi.fn()
  await installFaPlaywrightCursorMarkerIfVideoEnabled({
    evaluate
  } as never)
  expect(evaluate).not.toHaveBeenCalled()
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

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * When no recordVideo temp dir was queued for this TestInfo, skip attachment scan and rm.
 */
test('closeFaElectronAppWithRecordedVideoAttachments skips attach when the recordVideo queue is empty', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(attach).not.toHaveBeenCalled()
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Two queued temp dirs are consumed by two sequential closes; the WeakMap queue is not cleared until the last pop.
 */
test('closeFaElectronAppWithRecordedVideoAttachments uses one queued record dir per close call', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const first = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const second = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dirA = first.recordVideo!.dir
  const dirB = second.recordVideo!.dir
  fs.writeFileSync(path.join(dirA, 'a.webm'), Buffer.from('a'))
  fs.writeFileSync(path.join(dirB, 'b.webm'), Buffer.from('b'))

  const electronApp = {
    close: vi.fn().mockResolvedValue(undefined)
  } as never

  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
  expect(attach).toHaveBeenCalledTimes(1)
  expect(fs.existsSync(dirA)).toBe(false)
  expect(fs.existsSync(dirB)).toBe(true)

  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
  expect(attach).toHaveBeenCalledTimes(2)
  expect(fs.existsSync(dirB)).toBe(false)
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Optional third argument routes HTML report attachments away from the beforeAll queue TestInfo (multi-test serial suites).
 */
test('closeFaElectronAppWithRecordedVideoAttachments attaches via htmlReportAttachTestInfo when provided', async () => {
  const attachQueue = vi.fn().mockResolvedValue(undefined)
  const attachReport = vi.fn().mockResolvedValue(undefined)
  const queueTestInfo = {
    attach: attachQueue
  } as unknown as TestInfo
  const reportTestInfo = {
    attach: attachReport
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(queueTestInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, queueTestInfo, reportTestInfo)

  expect(attachQueue).not.toHaveBeenCalled()
  expect(attachReport).toHaveBeenCalled()
  expect(fs.existsSync(dir)).toBe(false)
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Recursively discovers WebM files under subfolders and uses path-prefixed attachment names.
 */
test('closeFaElectronAppWithRecordedVideoAttachments attaches nested webm paths with directory prefixes', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  const nested = path.join(dir, 'nested')
  fs.mkdirSync(nested, {
    recursive: true
  })
  fs.writeFileSync(path.join(nested, 'clip.webm'), Buffer.from('wm'))

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(attach).toHaveBeenCalled()
  const names = attach.mock.calls.map((call) => call[0] as string)
  expect(names.some((n) => n.includes('nested'))).toBe(true)
  expect(fs.existsSync(dir)).toBe(false)
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * After closing the app, attaches discovered WebM files from the queued recordVideo temp dir and deletes that dir.
 */
test('closeFaElectronAppWithRecordedVideoAttachments attaches webm files and removes the record temp dir', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(attach).toHaveBeenCalled()
  expect(fs.existsSync(dir)).toBe(false)
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Retries directory removal when the OS reports a transient busy or permission error (common on Windows after video finalize).
 */
test('closeFaElectronAppWithRecordedVideoAttachments retries temp dir removal on transient rm errors', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  const originalRm = fsPromises.rm.bind(fsPromises)
  let firstRm = true
  const rmSpy = vi.spyOn(fsPromises, 'rm').mockImplementation(async (targetPath, opts) => {
    if (firstRm) {
      firstRm = false
      throw Object.assign(new Error('EBUSY'), {
        code: 'EBUSY'
      })
    }
    return originalRm(targetPath, opts)
  })

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(rmSpy.mock.calls.length).toBeGreaterThanOrEqual(2)
  expect(fs.existsSync(dir)).toBe(false)
  rmSpy.mockRestore()
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * EPERM and UNKNOWN rm errors use the same delayed retry path as EBUSY.
 */
test('closeFaElectronAppWithRecordedVideoAttachments retries temp dir removal on EPERM then UNKNOWN', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  const originalRm = fsPromises.rm.bind(fsPromises)
  let phase = 0
  const rmSpy = vi.spyOn(fsPromises, 'rm').mockImplementation(async (targetPath, opts) => {
    if (phase === 0) {
      phase = 1
      throw Object.assign(new Error('EPERM'), {
        code: 'EPERM'
      })
    }
    if (phase === 1) {
      phase = 2
      throw Object.assign(new Error('UNKNOWN'), {
        code: 'UNKNOWN'
      })
    }
    return originalRm(targetPath, opts)
  })

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(rmSpy.mock.calls.length).toBeGreaterThanOrEqual(3)
  expect(fs.existsSync(dir)).toBe(false)
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Non-transient rm errors stop retrying immediately.
 */
test('closeFaElectronAppWithRecordedVideoAttachments stops retrying rm on non-transient errors', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  const rmSpy = vi.spyOn(fsPromises, 'rm').mockRejectedValue(
    Object.assign(new Error('ENOENT'), {
      code: 'ENOENT'
    })
  )

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(rmSpy).toHaveBeenCalledTimes(1)
  expect(fs.existsSync(dir)).toBe(true)
  fs.rmSync(dir, {
    force: true,
    recursive: true
  })
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Errors without an errno code property are treated as non-transient (ternary fallback in isWindowsTransientRmError).
 */
test('closeFaElectronAppWithRecordedVideoAttachments stops retrying rm when the rejection has no code field', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  const rmSpy = vi.spyOn(fsPromises, 'rm').mockRejectedValueOnce(new Error('no code property'))

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(rmSpy).toHaveBeenCalledTimes(1)
  expect(fs.existsSync(dir)).toBe(true)
  fs.rmSync(dir, {
    force: true,
    recursive: true
  })
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * After repeated transient failures, rm gives up on the final attempt without throwing outward.
 */
test(
  'closeFaElectronAppWithRecordedVideoAttachments ends rm retries after max attempts on persistent EBUSY',
  async () => {
    const attach = vi.fn().mockResolvedValue(undefined)
    const testInfo = {
      attach
    } as unknown as TestInfo
    const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
    const dir = partial.recordVideo!.dir
    fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

    const rmSpy = vi.spyOn(fsPromises, 'rm').mockRejectedValue(
      Object.assign(new Error('EBUSY'), {
        code: 'EBUSY'
      })
    )

    await closeFaElectronAppWithRecordedVideoAttachments({
      close: vi.fn().mockResolvedValue(undefined)
    } as never, testInfo)

    expect(rmSpy).toHaveBeenCalledTimes(16)
    expect(fs.existsSync(dir)).toBe(true)
    fs.rmSync(dir, {
      force: true,
      recursive: true
    })
  },
  12_000
)

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * Ignores non-webm files when scanning the record temp tree.
 */
test('closeFaElectronAppWithRecordedVideoAttachments attaches only webm leaf files', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir
  fs.writeFileSync(path.join(dir, 'notes.txt'), 'x')
  fs.writeFileSync(path.join(dir, 'clip.webm'), Buffer.from('wm'))

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(attach).toHaveBeenCalledTimes(1)
  expect(attach.mock.calls[0][0]).toBe('clip.webm')
})

/**
 * closeFaElectronAppWithRecordedVideoAttachments
 * When readdir fails, attachment scan aborts quietly.
 */
test('closeFaElectronAppWithRecordedVideoAttachments tolerates readdir failure on the temp dir', async () => {
  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo
  const partial = getFaPlaywrightElectronRecordVideoPartial(testInfo)
  const dir = partial.recordVideo!.dir

  const readdirSpy = vi
    .spyOn(fsPromises, 'readdir')
    .mockRejectedValueOnce(new Error('boom'))

  await closeFaElectronAppWithRecordedVideoAttachments({
    close: vi.fn().mockResolvedValue(undefined)
  } as never, testInfo)

  expect(readdirSpy).toHaveBeenCalled()
  expect(attach).not.toHaveBeenCalled()
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, {
      force: true,
      recursive: true
    })
  }
})
