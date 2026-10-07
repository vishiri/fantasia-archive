import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'

import { S_FaRecentProjects } from '../S_FaRecentProjects'

const getRecentMock = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  getRecentMock.mockReset()
  getRecentMock.mockResolvedValue([
    {
      filePath: '  D:\\dup.faproject ',
      name: 'Dup'
    },
    {
      filePath: 'D:\\dup.faproject',
      name: 'Dup2'
    },
    {
      filePath: 'relative.faproject',
      name: 'Bad'
    }
  ])
  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectManagement: {
        getRecentProjects: getRecentMock
      }
    }
  } as unknown as Window & typeof globalThis)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/**
 * S_FaRecentProjects
 * Defensive normalizer caps dedupes after bridge read.
 */
test('Test that refreshRecentProjects normalizes IPC rows', async () => {
  const store = S_FaRecentProjects()
  await store.refreshRecentProjects()
  expect(getRecentMock).toHaveBeenCalledOnce()
  expect(store.entries).toEqual([{
    filePath: 'D:\\dup.faproject',
    name: 'Dup'
  }])
})

test('Test that a recent-project refresh does not replace a later refresh', async () => {
  const store = S_FaRecentProjects()
  let resolveFirst: ((value: I_faRecentProjectEntry[]) => void) | undefined
  let calls = 0
  getRecentMock.mockImplementation(() => {
    calls += 1
    if (calls === 1) {
      return new Promise<I_faRecentProjectEntry[]>((resolve) => {
        resolveFirst = resolve
      })
    }
    return Promise.resolve([{
      filePath: 'D:\\new.faproject',
      name: 'New'
    }])
  })
  const first = store.refreshRecentProjects()
  const second = store.refreshRecentProjects()
  resolveFirst?.([{
    filePath: 'D:\\old.faproject',
    name: 'Old'
  }])
  await Promise.all([first, second])
  expect(store.entries).toEqual([{
    filePath: 'D:\\new.faproject',
    name: 'New'
  }])
})

test('Test that refreshRecentProjects clears when bridge is missing', async () => {
  vi.stubGlobal('window', { faContentBridgeAPIs: {} } as unknown as Window & typeof globalThis)
  const store = S_FaRecentProjects()
  store.entries = [{
    filePath: 'D:\\x.faproject',
    name: 'Stale'
  }]
  await store.refreshRecentProjects()
  expect(store.entries).toEqual([])
})
