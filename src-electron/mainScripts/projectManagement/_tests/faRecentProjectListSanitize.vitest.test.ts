import { beforeEach, expect, test, vi } from 'vitest'

const fsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  statSync: vi.fn()
}))

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: (...args: unknown[]) => fsMock.existsSync(...args),
      statSync: (...args: unknown[]) => fsMock.statSync(...args)
    },
    existsSync: (...args: unknown[]) => fsMock.existsSync(...args),
    statSync: (...args: unknown[]) => fsMock.statSync(...args)
  }
})

import {
  faRecentProjectsListsEqual,
  faRecentProjectsSanitizeForPersistence
} from '../faRecentProjectListSanitizeWiring'

beforeEach(() => {
  fsMock.existsSync.mockReset()
  fsMock.statSync.mockReset()
  fsMock.existsSync.mockReturnValue(true)
  fsMock.statSync.mockReturnValue({ isFile: (): boolean => true })
})

test('Test that sanitize returns empty for garbage root', () => {
  expect(faRecentProjectsSanitizeForPersistence(undefined)).toEqual([])
})

test('Test that sanitize dedupes caps and keeps existing files', () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({
    filePath: `D:\\p${i}.faproject`,
    name: `N${i}`
  }))
  const out = faRecentProjectsSanitizeForPersistence({ recentProjects: rows })
  expect(out.length).toBe(10)
})

test('Test that sanitize drops rows when path missing or not file', () => {
  fsMock.existsSync.mockReturnValueOnce(false)
  expect(
    faRecentProjectsSanitizeForPersistence({
      recentProjects: [{
        filePath: 'D:\\gone.faproject',
        name: 'G'
      }]
    })
  ).toEqual([])
  fsMock.existsSync.mockReturnValue(true)
  fsMock.statSync.mockReturnValueOnce({ isFile: (): boolean => false })
  expect(
    faRecentProjectsSanitizeForPersistence({
      recentProjects: [{
        filePath: 'D:\\dir.faproject',
        name: 'D'
      }]
    })
  ).toEqual([])
})

test('Test that sanitize swallows fs stat errors', () => {
  fsMock.statSync.mockImplementationOnce(() => {
    throw new Error('eacces')
  })
  expect(
    faRecentProjectsSanitizeForPersistence({
      recentProjects: [{
        filePath: 'D:\\x.faproject',
        name: 'X'
      }]
    })
  ).toEqual([])
})

test('Test that listsEqual compares json shapes', () => {
  const a = [{
    filePath: 'D:\\a.faproject',
    name: 'A'
  }]
  expect(faRecentProjectsListsEqual(a, a)).toBe(true)
  expect(faRecentProjectsListsEqual(a, [...a, ...a])).toBe(false)
})

test('Test that sanitize drops whitespace-only display names', () => {
  expect(
    faRecentProjectsSanitizeForPersistence({
      recentProjects: [{
        filePath: 'D:\\x.faproject',
        name: '   '
      }]
    })
  ).toEqual([])
})
