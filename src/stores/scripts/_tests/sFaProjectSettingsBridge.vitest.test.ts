import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'

const emptyRoot: I_faProjectSettingsRoot = {
  projectName: '',
  schemaVersion: 1
}

const {
  getProjectSettingsMock,
  notifyCreateMock,
  propagateMock,
  setProjectSettingsMock,
  tMock
} = vi.hoisted(() => {
  return {
    getProjectSettingsMock: vi.fn(async (): Promise<I_faProjectSettingsRoot> => ({ ...emptyRoot })),
    notifyCreateMock: vi.fn(),
    propagateMock: vi.fn(),
    setProjectSettingsMock: vi.fn(async (): Promise<boolean> => true),
    tMock: vi.fn((key: string) => key)
  }
})

vi.mock('quasar', () => {
  return {
    Notify: { create: notifyCreateMock }
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

vi.mock('app/src/scripts/projectManagement/projectManagement_manager', () => {
  return {
    propagateFaProjectSettingsToAppConsumers: propagateMock
  }
})

beforeEach(() => {
  getProjectSettingsMock.mockReset()
  getProjectSettingsMock.mockResolvedValue({ ...emptyRoot })
  setProjectSettingsMock.mockReset()
  setProjectSettingsMock.mockResolvedValue(true)
  notifyCreateMock.mockReset()
  propagateMock.mockReset()
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        projectManagement: {
          getProjectSettings: getProjectSettingsMock,
          setProjectSettings: setProjectSettingsMock
        }
      }
    },
    configurable: true,
    writable: true
  })
})

/**
 * faProjectSettingsRefreshFromBridge
 * Returns false when getProjectSettings is missing on the bridge.
 */
test('Test that faProjectSettingsRefreshFromBridge returns false when bridge is incomplete', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const applyRoot = vi.fn()
  const { faProjectSettingsRefreshFromBridge } = await import('../sFaProjectSettingsBridge')
  const ok = await faProjectSettingsRefreshFromBridge({ applyRoot })
  expect(ok).toBe(false)
  expect(applyRoot).not.toHaveBeenCalled()
})

/**
 * faProjectSettingsRefreshFromBridge
 * Applies root from a successful getProjectSettings read.
 */
test('Test that faProjectSettingsRefreshFromBridge applies root on success', async () => {
  const snapshot = {
    projectName: 'Loaded',
    schemaVersion: 1 as const
  }
  getProjectSettingsMock.mockResolvedValueOnce(snapshot)
  const applyRoot = vi.fn()
  const { faProjectSettingsRefreshFromBridge } = await import('../sFaProjectSettingsBridge')
  const ok = await faProjectSettingsRefreshFromBridge({ applyRoot })
  expect(ok).toBe(true)
  expect(applyRoot).toHaveBeenCalledWith(snapshot)
})

/**
 * faProjectSettingsRefreshFromBridge
 * Throws loadError when getProjectSettings rejects.
 */
test('Test that faProjectSettingsRefreshFromBridge throws when getProjectSettings fails', async () => {
  getProjectSettingsMock.mockRejectedValueOnce(new Error('read failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsRefreshFromBridge } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsRefreshFromBridge({ applyRoot: vi.fn() })
  ).rejects.toThrow('globalFunctionality.faProjectSettings.loadError')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsFetchFreshForDialog
 * Returns a fresh snapshot from getProjectSettings.
 */
test('Test that faProjectSettingsFetchFreshForDialog returns the bridge snapshot', async () => {
  const snapshot = {
    projectName: 'Dialog fresh',
    schemaVersion: 1 as const
  }
  getProjectSettingsMock.mockResolvedValueOnce(snapshot)
  const { faProjectSettingsFetchFreshForDialog } = await import('../sFaProjectSettingsBridge')
  await expect(faProjectSettingsFetchFreshForDialog()).resolves.toEqual(snapshot)
})

/**
 * faProjectSettingsFetchFreshForDialog
 * Rethrows Error rejections from getProjectSettings.
 */
test('Test that faProjectSettingsFetchFreshForDialog rethrows read failures', async () => {
  getProjectSettingsMock.mockRejectedValueOnce(new Error('dialog read failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsFetchFreshForDialog } = await import('../sFaProjectSettingsBridge')
  await expect(faProjectSettingsFetchFreshForDialog()).rejects.toThrow('dialog read failed')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsFetchFreshForDialog
 * Wraps non-Error rejections in Error instances.
 */
test('Test that faProjectSettingsFetchFreshForDialog wraps non-Error read failures', async () => {
  getProjectSettingsMock.mockRejectedValueOnce('dialog read string failure')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsFetchFreshForDialog } = await import('../sFaProjectSettingsBridge')
  await expect(faProjectSettingsFetchFreshForDialog()).rejects.toThrow('dialog read string failure')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsFetchFreshForDialog
 * Throws bridgeMissing when getProjectSettings is unavailable.
 */
test('Test that faProjectSettingsFetchFreshForDialog throws when bridge is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, { projectManagement: undefined as never })
  const { faProjectSettingsFetchFreshForDialog } = await import('../sFaProjectSettingsBridge')
  await expect(faProjectSettingsFetchFreshForDialog()).rejects.toThrow(
    'globalFunctionality.faProjectSettings.bridgeMissing'
  )
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Persists patch, read-backs, and propagates consumers without emitting success notify.
 */
test('Test that faProjectSettingsPersistPatchFromStore saves and propagates on matching read-back', async () => {
  const applyRoot = vi.fn()
  const patch = { projectName: 'Saved Name' }
  getProjectSettingsMock.mockResolvedValueOnce({
    projectName: 'Saved Name',
    schemaVersion: 1
  })
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await faProjectSettingsPersistPatchFromStore({
    applyRoot,
    patch
  })
  expect(setProjectSettingsMock).toHaveBeenCalledWith(patch)
  expect(applyRoot).toHaveBeenCalledWith({
    projectName: 'Saved Name',
    schemaVersion: 1
  })
  expect(propagateMock).toHaveBeenCalledWith({
    projectName: 'Saved Name',
    schemaVersion: 1
  })
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Throws saveError when setProjectSettings resolves false.
 */
test('Test that faProjectSettingsPersistPatchFromStore throws when setProjectSettings returns false', async () => {
  setProjectSettingsMock.mockResolvedValueOnce(false)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
  expect(getProjectSettingsMock).not.toHaveBeenCalled()
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Throws saveError when read-back does not match the patch.
 */
test('Test that faProjectSettingsPersistPatchFromStore throws on save mismatch', async () => {
  setProjectSettingsMock.mockResolvedValueOnce(true)
  getProjectSettingsMock.mockResolvedValueOnce({
    projectName: 'Different',
    schemaVersion: 1
  })
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'Wanted' }
    })
  ).rejects.toThrow('globalFunctionality.faProjectSettings.saveError')
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Throws bridgeMissing when setProjectSettings is unavailable.
 */
test('Test that faProjectSettingsPersistPatchFromStore throws when setProjectSettings is missing', async () => {
  Object.assign(window.faContentBridgeAPIs, {
    projectManagement: {
      getProjectSettings: getProjectSettingsMock
    }
  })
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('globalFunctionality.faProjectSettings.bridgeMissing')
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Rethrows setProjectSettings rejections.
 */
test('Test that faProjectSettingsPersistPatchFromStore rethrows setProjectSettings failures', async () => {
  setProjectSettingsMock.mockRejectedValueOnce('write failed')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('write failed')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Rethrows Error rejections from setProjectSettings unchanged.
 */
test('Test that faProjectSettingsPersistPatchFromStore rethrows Error set failures unchanged', async () => {
  setProjectSettingsMock.mockRejectedValueOnce(new Error('write Error instance'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('write Error instance')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Wraps non-Error setProjectSettings rejections in Error instances.
 */
test('Test that faProjectSettingsPersistPatchFromStore wraps non-Error set failures', async () => {
  setProjectSettingsMock.mockRejectedValueOnce({ reason: 'object failure' })
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('[object Object]')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Rethrows getProjectSettings failures after a successful set.
 */
test('Test that faProjectSettingsPersistPatchFromStore rethrows post-save read failures', async () => {
  setProjectSettingsMock.mockResolvedValueOnce(true)
  getProjectSettingsMock.mockRejectedValueOnce(new Error('read-back failed'))
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('read-back failed')
  errorSpy.mockRestore()
})

/**
 * faProjectSettingsPersistPatchFromStore
 * Wraps non-Error post-save read rejections in Error instances.
 */
test('Test that faProjectSettingsPersistPatchFromStore wraps non-Error post-save read failures', async () => {
  setProjectSettingsMock.mockResolvedValueOnce(true)
  getProjectSettingsMock.mockRejectedValueOnce('read-back string failure')
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const { faProjectSettingsPersistPatchFromStore } = await import('../sFaProjectSettingsBridge')
  await expect(
    faProjectSettingsPersistPatchFromStore({
      applyRoot: vi.fn(),
      patch: { projectName: 'X' }
    })
  ).rejects.toThrow('read-back string failure')
  errorSpy.mockRestore()
})
