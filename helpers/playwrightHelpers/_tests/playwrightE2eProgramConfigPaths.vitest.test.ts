import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { expect, test, vi } from 'vitest'

import * as prUserData from '../playwrightUserDataReset'
import {
  e2eSetNextProgramConfigExportPath,
  e2eSetNextProgramConfigImportPath,
  getPlaywrightE2eUserDataFilePath,
  removePlaywrightE2eBlankFaconfigFilesIfPresent,
  tryUnlinkE2eProgramConfigFixtureFiles
} from '../playwrightE2eProgramConfigPaths'

/** Must match 'faProgramConfigE2ePathOverride' main module. */
const FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH = '__faE2eSetNextProgramConfigExportPath' as const
/** Must match 'faProgramConfigE2ePathOverride' main module. */
const FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH = '__faE2eSetNextProgramConfigImportPath' as const

const getDirSpy = vi.spyOn(prUserData, 'getFaPlaywrightIsolatedUserDataDir')

test('getPlaywrightE2eUserDataFilePath appends the basename to the userData directory', () => {
  getDirSpy.mockReturnValueOnce('C:\\u\\d')
  expect(getPlaywrightE2eUserDataFilePath('foo.faconfig')).toBe(
    path.join('C:\\u\\d', 'foo.faconfig')
  )
})

test('removePlaywrightE2eBlankFaconfigFilesIfPresent is a no-op when the userData path is missing', () => {
  getDirSpy.mockReturnValueOnce(path.join('C:\\nope', 'missing-dir-xyz-12345'))
  removePlaywrightE2eBlankFaconfigFilesIfPresent()
})

test('removePlaywrightE2eBlankFaconfigFilesIfPresent deletes only blank_*.faconfig in the userData tree', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-pw-e2e-'))
  try {
    fs.writeFileSync(path.join(tmp, 'blank_settings.faconfig'), 'a')
    fs.writeFileSync(path.join(tmp, 'keep.txt'), 'b')
    getDirSpy.mockReturnValueOnce(tmp)
    removePlaywrightE2eBlankFaconfigFilesIfPresent()
    expect(fs.existsSync(path.join(tmp, 'blank_settings.faconfig'))).toBe(false)
    expect(fs.existsSync(path.join(tmp, 'keep.txt'))).toBe(true)
  } finally {
    fs.rmSync(tmp, {
      force: true,
      recursive: true
    })
  }
})

test('tryUnlinkE2eProgramConfigFixtureFiles ignores when files are missing', () => {
  getDirSpy.mockReturnValueOnce(path.join('C:\\nope', 'no-such-helpers-e2e-dir-999'))
  tryUnlinkE2eProgramConfigFixtureFiles()
})

test('tryUnlinkE2eProgramConfigFixtureFiles unlinks the three basenames when present', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-pw-e2e-clean-'))
  try {
    for (const name of ['blank_settings.faconfig', 'blank_keybinds.faconfig', 'blank_css.faconfig'] as const) {
      fs.writeFileSync(path.join(tmp, name), 'z')
    }
    getDirSpy.mockReturnValue(tmp)
    tryUnlinkE2eProgramConfigFixtureFiles()
    getDirSpy.mockReset()
    expect(fs.readdirSync(tmp)).toHaveLength(0)
  } finally {
    fs.rmSync(tmp, {
      force: true,
      recursive: true
    })
  }
})

test('e2eSetNextProgramConfigExportPath calls main evaluate with the export global key and absolute path', async () => {
  getDirSpy.mockReturnValueOnce('C:\\ud')
  const evaluate = vi.fn().mockResolvedValue(undefined)
  await e2eSetNextProgramConfigExportPath(
    { evaluate } as unknown as import('playwright').ElectronApplication,
    'n.faconfig'
  )
  expect(evaluate).toHaveBeenCalledWith(
    expect.any(Function),
    {
      k: FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH,
      p: path.join('C:\\ud', 'n.faconfig')
    }
  )
})

test('e2eSetNextProgramConfigImportPath calls main evaluate with the import global key and absolute path', async () => {
  getDirSpy.mockReturnValueOnce('C:\\ud2')
  const evaluate = vi.fn().mockResolvedValue(undefined)
  await e2eSetNextProgramConfigImportPath(
    { evaluate } as unknown as import('playwright').ElectronApplication,
    'i.faconfig'
  )
  expect(evaluate).toHaveBeenCalledWith(
    expect.any(Function),
    {
      k: FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH,
      p: path.join('C:\\ud2', 'i.faconfig')
    }
  )
})

test('e2e main path setter callback no-ops when the global handler key is missing', async () => {
  getDirSpy.mockReturnValueOnce('C:\\ud3')
  const evaluate = vi.fn(
    async (
      fn: (_e: unknown, a: { k: string, p: string }) => void,
      _arg: { k: string, p: string }
    ) => {
      fn(undefined, {
        k: '__not_installed__',
        p: 'C:\\x.faconfig'
      })
    }
  )
  await e2eSetNextProgramConfigExportPath(
    { evaluate } as unknown as import('playwright').ElectronApplication,
    'n.faconfig'
  )
  expect(evaluate).toHaveBeenCalled()
})
