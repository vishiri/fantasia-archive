import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

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
