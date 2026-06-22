import { beforeEach, expect, test, vi } from 'vitest'

const {
  listDocumentTemplatesForProjectSettingsMock,
  saveDocumentTemplatesSnapshotMock,
  tMock
} = vi.hoisted(() => {
  return {
    listDocumentTemplatesForProjectSettingsMock: vi.fn(async () => ({
      items: [
        {
          createdAtMs: 1,
          documentCount: 0,
          icon: 'mdi-account',
          id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          sortOrder: 0,
          titlePluralTranslations: { 'en-US': 'Character' },
          titleSingularTranslations: {},
          updatedAtMs: 1,
          worldAppendixTranslations: { 'en-US': 'Notes' }
        }
      ]
    })),
    saveDocumentTemplatesSnapshotMock: vi.fn(async () => undefined),
    tMock: vi.fn((key: string) => key)
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

beforeEach(() => {
  listDocumentTemplatesForProjectSettingsMock.mockReset()
  listDocumentTemplatesForProjectSettingsMock.mockResolvedValue({
    items: [
      {
        createdAtMs: 1,
        documentCount: 0,
        icon: 'mdi-account',
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        sortOrder: 0,
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
        updatedAtMs: 1,
        worldAppendixTranslations: { 'en-US': 'Notes' }
      }
    ]
  })
  saveDocumentTemplatesSnapshotMock.mockReset()
  saveDocumentTemplatesSnapshotMock.mockResolvedValue(undefined)
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listDocumentTemplatesForProjectSettings: listDocumentTemplatesForProjectSettingsMock,
          saveDocumentTemplatesSnapshot: saveDocumentTemplatesSnapshotMock
        }
      }
    },
    configurable: true,
    writable: true
  })
})

/**
 * faProjectDocumentTemplatesFetchFreshForDialog
 * Maps bridge rows into Project Settings draft items.
 */
test('Test that faProjectDocumentTemplatesFetchFreshForDialog returns mapped draft rows', async () => {
  const { faProjectDocumentTemplatesFetchFreshForDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(faProjectDocumentTemplatesFetchFreshForDialog()).resolves.toEqual([
    {
      documentCount: 0,
      icon: 'mdi-account',
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
      worldAppendixTranslations: { 'en-US': 'Notes' }
    }
  ])
})

/**
 * faProjectDocumentTemplatesPersistSnapshotFromDialog
 * Forwards the snapshot payload to the preload bridge.
 */
test('Test that faProjectDocumentTemplatesPersistSnapshotFromDialog calls saveDocumentTemplatesSnapshot', async () => {
  const { faProjectDocumentTemplatesPersistSnapshotFromDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  const items = [
    {
      id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
    }
  ]
  await faProjectDocumentTemplatesPersistSnapshotFromDialog(items)
  expect(saveDocumentTemplatesSnapshotMock).toHaveBeenCalledWith(items)
})

/**
 * faProjectDocumentTemplatesFetchFreshForDialog
 * Throws bridgeMissing when listDocumentTemplatesForProjectSettings is unavailable.
 */
test('Test that faProjectDocumentTemplatesFetchFreshForDialog throws when bridge is missing', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: {},
    configurable: true,
    writable: true
  })
  const { faProjectDocumentTemplatesFetchFreshForDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(faProjectDocumentTemplatesFetchFreshForDialog()).rejects.toThrow(
    'projectContent.listDocumentTemplatesForProjectSettings is unavailable'
  )
})

/**
 * faProjectDocumentTemplatesFetchFreshForDialog
 * Rethrows Error rejections from listDocumentTemplatesForProjectSettings.
 */
test('Test that faProjectDocumentTemplatesFetchFreshForDialog rethrows read failures', async () => {
  listDocumentTemplatesForProjectSettingsMock.mockRejectedValueOnce(new Error('list failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectDocumentTemplatesFetchFreshForDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(faProjectDocumentTemplatesFetchFreshForDialog()).rejects.toThrow('list failed')
  errorSpy.mockRestore()
})

/**
 * faProjectDocumentTemplatesFetchFreshForDialog
 * Wraps non-Error rejections in Error instances.
 */
test('Test that faProjectDocumentTemplatesFetchFreshForDialog wraps non-Error read failures', async () => {
  listDocumentTemplatesForProjectSettingsMock.mockRejectedValueOnce('list string failure')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectDocumentTemplatesFetchFreshForDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(faProjectDocumentTemplatesFetchFreshForDialog()).rejects.toThrow(
    'listDocumentTemplatesForProjectSettings failed'
  )
  errorSpy.mockRestore()
})

/**
 * faProjectDocumentTemplatesPersistSnapshotFromDialog
 * Throws when saveDocumentTemplatesSnapshot is unavailable.
 */
test('Test that faProjectDocumentTemplatesPersistSnapshotFromDialog throws when bridge is missing', async () => {
  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listDocumentTemplatesForProjectSettings: listDocumentTemplatesForProjectSettingsMock
        }
      }
    },
    configurable: true,
    writable: true
  })
  const { faProjectDocumentTemplatesPersistSnapshotFromDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(
    faProjectDocumentTemplatesPersistSnapshotFromDialog([
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
      }
    ])
  ).rejects.toThrow('globalFunctionality.faProjectSettings.bridgeMissing')
})

/**
 * faProjectDocumentTemplatesPersistSnapshotFromDialog
 * Surfaces saveError when saveDocumentTemplatesSnapshot rejects.
 */
test('Test that faProjectDocumentTemplatesPersistSnapshotFromDialog surfaces saveError on write failures', async () => {
  saveDocumentTemplatesSnapshotMock.mockRejectedValueOnce(new Error('save failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectDocumentTemplatesPersistSnapshotFromDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(
    faProjectDocumentTemplatesPersistSnapshotFromDialog([
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
      }
    ])
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
  errorSpy.mockRestore()
})

/**
 * faProjectDocumentTemplatesPersistSnapshotFromDialog
 * Surfaces saveError when saveDocumentTemplatesSnapshot rejects with a non-Error value.
 */
test('Test that faProjectDocumentTemplatesPersistSnapshotFromDialog surfaces saveError on non-Error write failures', async () => {
  saveDocumentTemplatesSnapshotMock.mockRejectedValueOnce('save string failure')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectDocumentTemplatesPersistSnapshotFromDialog } = await import('../sFaProjectDocumentTemplatesBridge')
  await expect(
    faProjectDocumentTemplatesPersistSnapshotFromDialog([
      {
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        titlePluralTranslations: { 'en-US': 'Character' },
        titleSingularTranslations: {},
      }
    ])
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
  errorSpy.mockRestore()
})
