import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { Result } from 'neverthrow'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const { BetterSqlite3Mock } = vi.hoisted(() => {
  return {
    BetterSqlite3Mock: vi.fn()
  }
})

vi.mock('better-sqlite3', () => {
  return {
    default: BetterSqlite3Mock
  }
})

import {
  closeFaProjectActiveDatabase,
  discardFaProjectCreateBackupFile,
  faProjectCreateStagingFilePath,
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath,
  openFaProjectDatabase,
  promoteFaProjectCreateStagingFile,
  replaceFaProjectActiveDatabase,
  restoreFaProjectCreateBackupFile,
  unlinkFaProjectFileIfExists
} from '../faProjectActiveDatabaseWiring'

const tracked: string[] = []

afterEach(() => {
  closeFaProjectActiveDatabase()
  BetterSqlite3Mock.mockReset()
  for (const p of tracked) {
    void Result.fromThrowable(
      (): void => {
        fs.rmSync(p, {
          force: true,
          recursive: true
        })
      },
      (): undefined => undefined
    )()
  }
  tracked.length = 0
})

beforeEach(() => {
  BetterSqlite3Mock.mockImplementation(function (_filePath: string) {
    return {
      close: vi.fn()
    }
  })
})

function track (p: string): void {
  tracked.push(p)
}

test('openFaProjectDatabase constructs better-sqlite3 with the file path', () => {
  const p = 'D:\\x\\y.faproject'
  const opened = openFaProjectDatabase(p)
  expect(BetterSqlite3Mock).toHaveBeenCalledWith(p)
  expect(opened).toHaveProperty('close')
})

test('unlinkFaProjectFileIfExists removes an existing file', () => {
  const p = path.join(os.tmpdir(), `fa-unlink-${Date.now()}.faproject`)
  track(p)
  fs.writeFileSync(p, '')
  expect(fs.existsSync(p)).toBe(true)
  unlinkFaProjectFileIfExists(p)
  expect(fs.existsSync(p)).toBe(false)
})

test('unlinkFaProjectFileIfExists does nothing when the file is missing', () => {
  const p = path.join(os.tmpdir(), `fa-missing-${Date.now()}.faproject`)
  unlinkFaProjectFileIfExists(p)
})

test('promoteFaProjectCreateStagingFile replaces an existing project and keeps the backup', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-promote-'))
  tracked.push(dir)
  const target = path.join(dir, 'realm.faproject')
  const staging = faProjectCreateStagingFilePath(target)
  fs.writeFileSync(target, 'old')
  fs.writeFileSync(staging, 'new')
  promoteFaProjectCreateStagingFile(staging, target)
  expect(fs.readFileSync(target, 'utf8')).toBe('new')
  expect(fs.existsSync(staging)).toBe(false)
  expect(fs.readFileSync(`${target}.creating-bak`, 'utf8')).toBe('old')
  discardFaProjectCreateBackupFile(target)
  expect(fs.existsSync(`${target}.creating-bak`)).toBe(false)
})

test('restoreFaProjectCreateBackupFile puts the previous project back', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-restore-'))
  tracked.push(dir)
  const target = path.join(dir, 'realm.faproject')
  const staging = faProjectCreateStagingFilePath(target)
  fs.writeFileSync(target, 'old')
  fs.writeFileSync(staging, 'new')
  promoteFaProjectCreateStagingFile(staging, target)
  restoreFaProjectCreateBackupFile(target)
  expect(fs.readFileSync(target, 'utf8')).toBe('old')
  expect(fs.existsSync(`${target}.creating-bak`)).toBe(false)
})

test('promoteFaProjectCreateStagingFile keeps the existing project when staging is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-promote-miss-'))
  tracked.push(dir)
  const target = path.join(dir, 'realm.faproject')
  const staging = faProjectCreateStagingFilePath(target)
  fs.writeFileSync(target, 'old')
  expect(() => {
    promoteFaProjectCreateStagingFile(staging, target)
  }).toThrow()
  expect(fs.readFileSync(target, 'utf8')).toBe('old')
  expect(fs.existsSync(`${target}.creating-bak`)).toBe(false)
})

const FA_TEST_PROJECT_A = 'D:\\test\\a.faproject'
const FA_TEST_PROJECT_B = 'D:\\test\\b.faproject'
const FA_TEST_PROJECT_C = 'D:\\test\\c.faproject'
const FA_TEST_PROJECT_SAME = 'D:\\test\\same.faproject'

test('replaceFaProjectActiveDatabase swaps handles and closeFaProjectActiveDatabase clears', () => {
  const db1 = { close: vi.fn() }
  const db2 = { close: vi.fn() }
  let i = 0
  BetterSqlite3Mock.mockImplementation(function () {
    i += 1
    return i === 1 ? db1 : db2
  })
  replaceFaProjectActiveDatabase(openFaProjectDatabase(FA_TEST_PROJECT_A), FA_TEST_PROJECT_A)
  expect(getFaProjectActiveDatabase()).toBe(db1)
  replaceFaProjectActiveDatabase(openFaProjectDatabase(FA_TEST_PROJECT_B), FA_TEST_PROJECT_B)
  expect(getFaProjectActiveDatabase()).toBe(db2)
  expect(db1.close).toHaveBeenCalledOnce()
  closeFaProjectActiveDatabase()
  expect(db2.close).toHaveBeenCalledOnce()
  expect(getFaProjectActiveDatabase()).toBeNull()
})

test('replaceFaProjectActiveDatabase does not close when re-applying the same handle', () => {
  const db = { close: vi.fn() }
  BetterSqlite3Mock.mockImplementation(function () {
    return db
  })
  const opened = openFaProjectDatabase(FA_TEST_PROJECT_SAME)
  replaceFaProjectActiveDatabase(opened, FA_TEST_PROJECT_SAME)
  replaceFaProjectActiveDatabase(opened, FA_TEST_PROJECT_SAME)
  expect(db.close).not.toHaveBeenCalled()
  closeFaProjectActiveDatabase()
})

test('closeFaProjectActiveDatabase tolerates close errors', () => {
  const db = {
    close: vi.fn(() => {
      throw new Error('close-failed')
    })
  }
  BetterSqlite3Mock.mockImplementation(function () {
    return db
  })
  replaceFaProjectActiveDatabase(openFaProjectDatabase(FA_TEST_PROJECT_C), FA_TEST_PROJECT_C)
  closeFaProjectActiveDatabase()
  expect(getFaProjectActiveDatabase()).toBeNull()
})

test('closeFaProjectActiveDatabase is harmless when nothing is open', () => {
  closeFaProjectActiveDatabase()
  expect(getFaProjectActiveDatabase()).toBeNull()
})

test('getFaProjectLastKnownActiveProjectFilePath mirrors replaceFaProjectActiveDatabase and clears on full close', () => {
  const db = { close: vi.fn() }
  BetterSqlite3Mock.mockImplementation(function () {
    return db
  })
  const opened = openFaProjectDatabase(FA_TEST_PROJECT_A)
  replaceFaProjectActiveDatabase(opened, FA_TEST_PROJECT_A)
  expect(getFaProjectLastKnownActiveProjectFilePath()).toBe(FA_TEST_PROJECT_A)
  closeFaProjectActiveDatabase()
  expect(getFaProjectLastKnownActiveProjectFilePath()).toBeNull()
})

test('replaceFaProjectActiveDatabase rejects paths that do not look like project files', () => {
  const opened = {
    close: vi.fn()
  } as never
  expect(() => {
    replaceFaProjectActiveDatabase(opened, 'D:\\x\\bad.txt')
  }).toThrow('replaceFaProjectActiveDatabase')
})
