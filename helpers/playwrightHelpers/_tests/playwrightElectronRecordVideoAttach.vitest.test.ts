import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { TestInfo } from '@playwright/test'
import {
  expect,
  test,
  vi
} from 'vitest'

import {
  attachWebmFilesUnderDir,
  removeRecordVideoTempDirBestEffort
} from '../playwrightElectronRecordVideoAttach'

/**
 * removeRecordVideoTempDirBestEffort
 * Removes an existing temp directory created for recordVideo scratch output.
 */
test('removeRecordVideoTempDirBestEffort deletes an existing directory', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-pw-rm-'))
  await removeRecordVideoTempDirBestEffort(dir)
  expect(fs.existsSync(dir)).toBe(false)
})

/**
 * attachWebmFilesUnderDir
 * Attaches webm files at the root of the scan directory.
 */
test('attachWebmFilesUnderDir attaches webm files with expected names', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-pw-att-'))
  const webm = path.join(dir, 'clip.webm')
  fs.writeFileSync(webm, Buffer.from([0]))

  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo

  await attachWebmFilesUnderDir(testInfo, dir, '')

  expect(attach).toHaveBeenCalledWith(
    'clip.webm',
    expect.objectContaining({
      contentType: 'video/webm',
      path: webm
    })
  )

  fs.rmSync(dir, {
    force: true,
    recursive: true
  })
})

/**
 * attachWebmFilesUnderDir
 * Recurses into subdirectories and prefixes attachment names with the folder path.
 */
test('attachWebmFilesUnderDir nests webm paths under subfolders', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-pw-att-'))
  const sub = path.join(dir, 'nested')
  fs.mkdirSync(sub)
  const webm = path.join(sub, 'inner.webm')
  fs.writeFileSync(webm, Buffer.from([1]))

  const attach = vi.fn().mockResolvedValue(undefined)
  const testInfo = {
    attach
  } as unknown as TestInfo

  await attachWebmFilesUnderDir(testInfo, dir, '')

  expect(attach).toHaveBeenCalledWith(
    'nested/inner.webm',
    expect.objectContaining({
      contentType: 'video/webm',
      path: webm
    })
  )

  fs.rmSync(dir, {
    force: true,
    recursive: true
  })
})
