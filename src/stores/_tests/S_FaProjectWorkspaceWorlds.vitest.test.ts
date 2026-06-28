/** @vitest-environment jsdom */
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

const listWorldsMock = vi.fn(async () => ({
  items: [
    {
      color: '#000000',
      colorPallete: '',
      createdAtMs: 1,
      displayName: 'Second',
      displayNameTranslations: {
        'en-US': 'Second World',
        de: 'Zweite Welt'
      },
      id: 'world-2',
      sortOrder: 1,
      updatedAtMs: 1
    },
    {
      color: '#111111',
      colorPallete: '',
      createdAtMs: 2,
      displayName: 'First',
      displayNameTranslations: { 'en-US': 'First World' },
      id: 'world-1',
      sortOrder: 0,
      updatedAtMs: 2
    }
  ]
}))

beforeEach(() => {
  setActivePinia(createPinia())
  listWorldsMock.mockClear()
  window.faContentBridgeAPIs = {
    projectContent: {
      listWorlds: listWorldsMock
    }
  } as never
  S_FaUserSettings().settings = { ...FA_USER_SETTINGS_DEFAULTS }
  S_FaActiveProject().clearActiveProject()
})

test('Test that refreshWorkspaceWorlds clears the list when no project is active', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  const store = S_FaProjectWorkspaceWorlds()

  await store.refreshWorkspaceWorlds()

  expect(store.worldListItems).toEqual([])
  expect(listWorldsMock).not.toHaveBeenCalled()
})

test('Test that refreshWorkspaceWorlds maps listWorlds rows using the active language', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  }

  const store = S_FaProjectWorkspaceWorlds()
  await store.refreshWorkspaceWorlds()

  expect(listWorldsMock).toHaveBeenCalledTimes(1)
  expect(store.worldListItems).toEqual([
    {
      displayName: 'Zweite Welt',
      id: 'world-2'
    },
    {
      displayName: 'First World',
      id: 'world-1'
    }
  ])
})

test('Test that refreshWorkspaceWorlds re-maps display names when the language changes', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })

  const store = S_FaProjectWorkspaceWorlds()
  await store.refreshWorkspaceWorlds()

  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  }
  await Promise.resolve()

  expect(store.worldListItems[0]?.displayName).toBe('Zweite Welt')
})

test('Test that refreshWorkspaceWorlds clears the list when listWorlds is unavailable', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  window.faContentBridgeAPIs = {
    projectContent: {}
  } as never

  const store = S_FaProjectWorkspaceWorlds()
  await store.refreshWorkspaceWorlds()

  expect(store.worldListItems).toEqual([])
})

test('Test that refreshWorkspaceWorlds clears the list when listWorlds rejects', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  listWorldsMock.mockRejectedValueOnce(new Error('listWorlds failed'))

  const store = S_FaProjectWorkspaceWorlds()
  await store.refreshWorkspaceWorlds()

  expect(store.worldListItems).toEqual([])
  expect(consoleErrorSpy).toHaveBeenCalled()
  consoleErrorSpy.mockRestore()
})

test('Test that language changes do not remap when the workspace world list is empty', async () => {
  const { S_FaProjectWorkspaceWorlds } = await import('../S_FaProjectWorkspaceWorlds')
  const store = S_FaProjectWorkspaceWorlds()

  S_FaUserSettings().settings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  }
  await Promise.resolve()

  expect(store.worldListItems).toEqual([])
})
