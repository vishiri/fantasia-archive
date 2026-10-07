/**
 * @vitest-environment jsdom
 */
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID } from 'app/types/I_faProjectDialogUiPrefDomain'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

import {
  readFaProjectDialogUiPrefFromBridge,
  readFaProjectLastSelectedWorldId,
  writeFaProjectDialogUiPrefViaBridge,
  writeFaProjectLastSelectedWorldId
} from '../projectDialogUiPrefBridgeWiring'

beforeEach(() => {
  Reflect.deleteProperty(window, 'faContentBridgeAPIs')
})

afterEach(() => {
  setActivePinia(undefined)
  Reflect.deleteProperty(window, 'faContentBridgeAPIs')
  vi.restoreAllMocks()
})

/**
 * readFaProjectDialogUiPrefFromBridge
 * Missing bridge API returns null.
 */
test('Test that readFaProjectDialogUiPrefFromBridge returns null without bridge', async () => {
  await expect(
    readFaProjectDialogUiPrefFromBridge(FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID)
  ).resolves.toBeNull()
})

/**
 * readFaProjectDialogUiPrefFromBridge
 * Returns stored value from bridge get.
 */
test('Test that readFaProjectDialogUiPrefFromBridge returns bridge value', async () => {
  window.faContentBridgeAPIs = {
    projectManagement: {
      getProjectDialogUiPref: vi.fn(async () => {
        return {
          key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
          value: 'world-a'
        }
      })
    }
  } as never

  await expect(
    readFaProjectDialogUiPrefFromBridge(FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID)
  ).resolves.toBe('world-a')
})

/**
 * readFaProjectDialogUiPrefFromBridge
 * Rejects from bridge log and return null.
 */
test('Test that readFaProjectDialogUiPrefFromBridge returns null on bridge error', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  window.faContentBridgeAPIs = {
    projectManagement: {
      getProjectDialogUiPref: vi.fn(async () => {
        throw new Error('boom')
      })
    }
  } as never

  await expect(
    readFaProjectDialogUiPrefFromBridge(FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID)
  ).resolves.toBeNull()
  expect(errorSpy).toHaveBeenCalledWith(
    '[projectDialogUiPref] getProjectDialogUiPref failed',
    expect.any(Error)
  )
})

/**
 * writeFaProjectDialogUiPrefViaBridge
 * No-ops when set bridge is missing.
 */
test('Test that writeFaProjectDialogUiPrefViaBridge no-ops without bridge', async () => {
  await expect(
    writeFaProjectDialogUiPrefViaBridge(
      FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
      'world-b'
    )
  ).resolves.toBeUndefined()
})

/**
 * writeFaProjectDialogUiPrefViaBridge
 * Invokes set bridge with key and value.
 */
test('Test that writeFaProjectDialogUiPrefViaBridge calls set bridge', async () => {
  const setMock = vi.fn(async () => true)
  window.faContentBridgeAPIs = {
    projectManagement: {
      setProjectDialogUiPref: setMock
    }
  } as never

  await writeFaProjectDialogUiPrefViaBridge(
    FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
    'world-b'
  )
  expect(setMock).toHaveBeenCalledWith({
    key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
    value: 'world-b'
  })
})

/**
 * writeFaProjectDialogUiPrefViaBridge
 * Bridge reject logs error and does not throw.
 */
test('Test that writeFaProjectDialogUiPrefViaBridge skips the write while a project open is in flight', async () => {
  setActivePinia(createPinia())
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-a',
    name: 'A'
  })
  vi.spyOn(S_FaActiveProject(), 'isProjectReplacementInFlight').mockReturnValue(true)
  const setMock = vi.fn(async () => true)
  window.faContentBridgeAPIs = {
    projectManagement: {
      setProjectDialogUiPref: setMock
    }
  } as never
  await writeFaProjectDialogUiPrefViaBridge(
    FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
    'world-b'
  )
  expect(setMock).not.toHaveBeenCalled()
})

test('Test that writeFaProjectDialogUiPrefViaBridge swallows bridge errors', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  window.faContentBridgeAPIs = {
    projectManagement: {
      setProjectDialogUiPref: vi.fn(async () => {
        throw new Error('write-fail')
      })
    }
  } as never

  await expect(
    writeFaProjectDialogUiPrefViaBridge(
      FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
      'world-c'
    )
  ).resolves.toBeUndefined()
  expect(errorSpy).toHaveBeenCalledWith(
    '[projectDialogUiPref] setProjectDialogUiPref failed',
    expect.any(Error)
  )
})

/**
 * readFaProjectLastSelectedWorldId / writeFaProjectLastSelectedWorldId
 * Convenience wrappers use the shared last-selected world key.
 */
test('Test that last-selected world helpers use the shared pref key', async () => {
  const getMock = vi.fn(async () => {
    return {
      key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
      value: 'world-z'
    }
  })
  const setMock = vi.fn(async () => true)
  window.faContentBridgeAPIs = {
    projectManagement: {
      getProjectDialogUiPref: getMock,
      setProjectDialogUiPref: setMock
    }
  } as never

  await expect(readFaProjectLastSelectedWorldId()).resolves.toBe('world-z')
  expect(getMock).toHaveBeenCalledWith({
    key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID
  })

  await writeFaProjectLastSelectedWorldId('world-y')
  expect(setMock).toHaveBeenCalledWith({
    key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
    value: 'world-y'
  })
})

test('Test that writeFaProjectLastSelectedWorldId keeps the later world when writes overlap', async () => {
  let releaseFirst: (() => void) | undefined
  const setMock = vi.fn(() => {
    if (setMock.mock.calls.length === 1) {
      return new Promise<boolean>((resolve) => {
        releaseFirst = () => {
          resolve(true)
        }
      })
    }
    return Promise.resolve(true)
  })
  window.faContentBridgeAPIs = {
    projectManagement: {
      setProjectDialogUiPref: setMock
    }
  } as never

  const firstWrite = writeFaProjectLastSelectedWorldId('world-a')
  const secondWrite = writeFaProjectLastSelectedWorldId('world-b')
  await vi.waitUntil(() => releaseFirst !== undefined)
  expect(setMock).toHaveBeenCalledTimes(1)
  expect(setMock).toHaveBeenCalledWith({
    key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
    value: 'world-a'
  })
  releaseFirst?.()
  await firstWrite
  await secondWrite
  expect(setMock).toHaveBeenNthCalledWith(2, {
    key: FA_PROJECT_DIALOG_UI_PREF_LAST_SELECTED_WORLD_ID,
    value: 'world-b'
  })
})

test('Test that writeFaProjectLastSelectedWorldId survives a synchronous bridge throw', async () => {
  window.faContentBridgeAPIs = {
    projectManagement: {
      setProjectDialogUiPref: () => {
        throw new Error('sync-write')
      }
    }
  } as never
  await expect(writeFaProjectLastSelectedWorldId('world-sync')).rejects.toThrow('sync-write')
})
