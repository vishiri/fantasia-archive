import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const { getPathMock } = vi.hoisted(() => {
  return {
    getPathMock: vi.fn((name: string) => {
      if (name === 'downloads') {
        return 'D:\\dl'
      }
      if (name === 'userData') {
        return 'D:\\ud'
      }
      return 'D:\\other'
    })
  }
})

vi.mock('electron', () => {
  return {
    app: {
      getPath: getPathMock
    }
  }
})

import {
  faProjectSaveDialogDefaultDirectory,
  getFaProjectSaveDefaultPath
} from '../faProjectFileDialogDefaultPaths'

beforeEach(() => {
  getPathMock.mockClear()
  delete process.env.TEST_ENV
})

afterEach(() => {
  delete process.env.TEST_ENV
})

test('faProjectSaveDialogDefaultDirectory uses downloads outside e2e', () => {
  expect(faProjectSaveDialogDefaultDirectory()).toBe('D:\\dl')
  expect(getPathMock).toHaveBeenCalledWith('downloads')
})

test('faProjectSaveDialogDefaultDirectory uses userData when TEST_ENV is e2e', () => {
  process.env.TEST_ENV = 'e2e'
  expect(faProjectSaveDialogDefaultDirectory()).toBe('D:\\ud')
  expect(getPathMock).toHaveBeenCalledWith('userData')
})

test('getFaProjectSaveDefaultPath joins directory and basename', () => {
  expect(getFaProjectSaveDefaultPath('a.faproject')).toBe('D:\\dl\\a.faproject')
})
