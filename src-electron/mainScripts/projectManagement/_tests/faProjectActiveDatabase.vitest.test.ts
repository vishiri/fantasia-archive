import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

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
  getFaProjectActiveDatabase,
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase,
  unlinkFaProjectFileIfExists
} from '../faProjectActiveDatabase'

const tracked: string[] = []

afterEach(() => {
  closeFaProjectActiveDatabase()
  BetterSqlite3Mock.mockReset()
  for (const p of tracked) {
    try {
      fs.unlinkSync(p)
    } catch {
      // ignore stray temp cleanup failures on Windows handles
    }
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

test('replaceFaProjectActiveDatabase swaps handles and closeFaProjectActiveDatabase clears', () => {
  const db1 = { close: vi.fn() }
  const db2 = { close: vi.fn() }
  let i = 0
  BetterSqlite3Mock.mockImplementation(function () {
    i += 1
    return i === 1 ? db1 : db2
  })
  replaceFaProjectActiveDatabase(openFaProjectDatabase('a.faproject'))
  expect(getFaProjectActiveDatabase()).toBe(db1)
  replaceFaProjectActiveDatabase(openFaProjectDatabase('b.faproject'))
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
  const opened = openFaProjectDatabase('same.faproject')
  replaceFaProjectActiveDatabase(opened)
  replaceFaProjectActiveDatabase(opened)
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
  replaceFaProjectActiveDatabase(openFaProjectDatabase('c.faproject'))
  closeFaProjectActiveDatabase()
  expect(getFaProjectActiveDatabase()).toBeNull()
})

test('closeFaProjectActiveDatabase is harmless when nothing is open', () => {
  closeFaProjectActiveDatabase()
  expect(getFaProjectActiveDatabase()).toBeNull()
})
