import { beforeEach, expect, test, vi } from 'vitest'

const {
  listWorldsForProjectSettingsMock,
  saveWorldsSnapshotMock,
  tMock
} = vi.hoisted(() => {
  return {
    listWorldsForProjectSettingsMock: vi.fn(async () => ({
      items: [
        {
          color: '#808080',
          colorPallete: '',
          createdAtMs: 1,
          displayNameTranslations: { 'en-US': 'Realm' },
          documentCount: 2,
          id: '550e8400-e29b-41d4-a716-446655440000',
          sortOrder: 0,
          templateLayout: {
            groups: [],
            placements: []
          },
          updatedAtMs: 1
        }
      ]
    })),
    saveWorldsSnapshotMock: vi.fn(async () => undefined),
    tMock: vi.fn((key: string) => key)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

beforeEach(() => {
  listWorldsForProjectSettingsMock.mockReset()
  listWorldsForProjectSettingsMock.mockResolvedValue({
    items: [
      {
        color: '#808080',
        colorPallete: '',
        createdAtMs: 1,
        displayNameTranslations: { 'en-US': 'Realm' },
        documentCount: 2,
        id: '550e8400-e29b-41d4-a716-446655440000',
        sortOrder: 0,
        templateLayout: {
          groups: [],
          placements: []
        },
        updatedAtMs: 1
      }
    ]
  })
  saveWorldsSnapshotMock.mockReset()
  saveWorldsSnapshotMock.mockResolvedValue(undefined)
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listWorldsForProjectSettings: listWorldsForProjectSettingsMock,
          saveWorldsSnapshot: saveWorldsSnapshotMock
        }
      }
    },
    configurable: true,
    writable: true
  })
})

/**
 * faProjectWorldsFetchFreshForDialog
 * Maps bridge rows into Project Settings draft items.
 */
test('Test that faProjectWorldsFetchFreshForDialog returns mapped draft rows', async () => {
  const { faProjectWorldsFetchFreshForDialog } = await import('../sFaProjectWorldsBridge')
  await expect(faProjectWorldsFetchFreshForDialog()).resolves.toEqual([
    {
      color: '#808080',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 2,
      id: '550e8400-e29b-41d4-a716-446655440000',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])
})

/**
 * faProjectWorldsFetchFreshForDialog
 * Uses an empty layout draft when the bridge row omits templateLayout.
 */
test('Test that faProjectWorldsFetchFreshForDialog defaults missing templateLayout to empty draft', async () => {
  listWorldsForProjectSettingsMock.mockResolvedValueOnce({
    items: [
      {
        color: '#808080',
        colorPallete: '',
        createdAtMs: 1,
        displayNameTranslations: { 'en-US': 'Realm' },
        documentCount: 0,
        id: '550e8400-e29b-41d4-a716-446655440000',
        sortOrder: 0,
        updatedAtMs: 1
      } as never
    ]
  })
  const { faProjectWorldsFetchFreshForDialog } = await import('../sFaProjectWorldsBridge')
  const rows = await faProjectWorldsFetchFreshForDialog()
  expect(rows[0]?.templateLayout).toEqual({
    groups: [],
    placements: []
  })
})

/**
 * faProjectWorldsFetchFreshForDialog
 * Throws bridgeMissing when listWorldsForProjectSettings is unavailable.
 */
test('Test that faProjectWorldsFetchFreshForDialog throws when bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectContent: undefined as never })
  const { faProjectWorldsFetchFreshForDialog } = await import('../sFaProjectWorldsBridge')
  await expect(faProjectWorldsFetchFreshForDialog()).rejects.toThrow(
    'globalFunctionality.faProjectSettings.bridgeMissing'
  )
})

/**
 * faProjectWorldsFetchFreshForDialog
 * Rethrows Error rejections from listWorldsForProjectSettings.
 */
test('Test that faProjectWorldsFetchFreshForDialog rethrows read failures', async () => {
  listWorldsForProjectSettingsMock.mockRejectedValueOnce(new Error('list failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectWorldsFetchFreshForDialog } = await import('../sFaProjectWorldsBridge')
  await expect(faProjectWorldsFetchFreshForDialog()).rejects.toThrow('list failed')
  errorSpy.mockRestore()
})

/**
 * faProjectWorldsFetchFreshForDialog
 * Wraps non-Error rejections in Error instances.
 */
test('Test that faProjectWorldsFetchFreshForDialog wraps non-Error read failures', async () => {
  listWorldsForProjectSettingsMock.mockRejectedValueOnce('list string failure')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectWorldsFetchFreshForDialog } = await import('../sFaProjectWorldsBridge')
  await expect(faProjectWorldsFetchFreshForDialog()).rejects.toThrow('list string failure')
  errorSpy.mockRestore()
})

/**
 * faProjectWorldsPersistSnapshotFromDialog
 * Delegates to saveWorldsSnapshot on the bridge.
 */
test('Test that faProjectWorldsPersistSnapshotFromDialog saves the snapshot', async () => {
  const items = [
    {
      displayNameTranslations: { 'en-US': 'Realm' },
      id: '550e8400-e29b-41d4-a716-446655440000'
    }
  ]
  const { faProjectWorldsPersistSnapshotFromDialog } = await import('../sFaProjectWorldsBridge')
  await faProjectWorldsPersistSnapshotFromDialog(items)
  expect(saveWorldsSnapshotMock).toHaveBeenCalledWith(items)
})

/**
 * faProjectWorldsPersistSnapshotFromDialog
 * Throws bridgeMissing when saveWorldsSnapshot is unavailable.
 */
test('Test that faProjectWorldsPersistSnapshotFromDialog throws when bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    projectContent: {
      listWorldsForProjectSettings: listWorldsForProjectSettingsMock
    }
  })
  const { faProjectWorldsPersistSnapshotFromDialog } = await import('../sFaProjectWorldsBridge')
  await expect(
    faProjectWorldsPersistSnapshotFromDialog([
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ])
  ).rejects.toThrow('globalFunctionality.faProjectSettings.bridgeMissing')
})

/**
 * faProjectWorldsPersistSnapshotFromDialog
 * Surfaces saveError when saveWorldsSnapshot rejects.
 */
test('Test that faProjectWorldsPersistSnapshotFromDialog surfaces saveError on write failures', async () => {
  saveWorldsSnapshotMock.mockRejectedValueOnce(new Error('save failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectWorldsPersistSnapshotFromDialog } = await import('../sFaProjectWorldsBridge')
  await expect(
    faProjectWorldsPersistSnapshotFromDialog([
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ])
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
  errorSpy.mockRestore()
})

/**
 * faProjectWorldsPersistSnapshotFromDialog
 * Surfaces saveError when saveWorldsSnapshot rejects with a non-Error value.
 */
test('Test that faProjectWorldsPersistSnapshotFromDialog surfaces saveError on non-Error write failures', async () => {
  saveWorldsSnapshotMock.mockRejectedValueOnce('save string failure')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectWorldsPersistSnapshotFromDialog } = await import('../sFaProjectWorldsBridge')
  await expect(
    faProjectWorldsPersistSnapshotFromDialog([
      {
        displayNameTranslations: { 'en-US': 'Realm' },
        id: '550e8400-e29b-41d4-a716-446655440000'
      }
    ])
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
  errorSpy.mockRestore()
})
