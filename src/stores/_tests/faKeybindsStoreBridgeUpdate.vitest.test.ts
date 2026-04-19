import { expect, test, vi } from 'vitest'

const { notifyCreateMock, tMock, setKeybindsMock } = vi.hoisted(() => {
  return {
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((key: string) => key),
    setKeybindsMock: vi.fn(async () => undefined)
  }
})

vi.mock('quasar', () => {
  return { Notify: { create: notifyCreateMock } }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return { i18n: { global: { t: tMock } } }
})

/**
 * runFaKeybindsUpdateKeybinds
 * Returns false when setKeybinds is not on the bridge.
 */
test('Test that runFaKeybindsUpdateKeybinds returns false when setKeybinds is missing', async () => {
  vi.resetModules()
  const refresh = vi.fn(async () => undefined)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        faKeybinds: {}
      }
    },
    writable: true
  })

  const { runFaKeybindsUpdateKeybinds } = await import('../faKeybindsStoreBridgeUpdate')
  const ok = await runFaKeybindsUpdateKeybinds(
    {
      replaceAllOverrides: true,
      overrides: {}
    },
    refresh
  )

  expect(ok).toBe(false)
  expect(refresh).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * runFaKeybindsUpdateKeybinds
 * Returns false without raising a notify when setKeybinds rejects (action manager owns the error toast now).
 */
test('Test that runFaKeybindsUpdateKeybinds returns false when setKeybinds rejects', async () => {
  vi.resetModules()
  notifyCreateMock.mockReset()
  setKeybindsMock.mockReset()
  setKeybindsMock.mockRejectedValueOnce(new Error('ipc fail'))
  const refresh = vi.fn(async () => undefined)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        faKeybinds: { setKeybinds: setKeybindsMock }
      }
    },
    writable: true
  })

  const { runFaKeybindsUpdateKeybinds } = await import('../faKeybindsStoreBridgeUpdate')
  const ok = await runFaKeybindsUpdateKeybinds(
    {
      replaceAllOverrides: true,
      overrides: {}
    },
    refresh
  )

  expect(ok).toBe(false)
  expect(refresh).not.toHaveBeenCalled()
  expect(notifyCreateMock).not.toHaveBeenCalled()
})

/**
 * runFaKeybindsUpdateKeybinds
 * Calls refresh then success notify after setKeybinds resolves.
 */
test('Test that runFaKeybindsUpdateKeybinds refreshes and notifies on success', async () => {
  vi.resetModules()
  notifyCreateMock.mockReset()
  setKeybindsMock.mockReset()
  setKeybindsMock.mockResolvedValue(undefined)
  const refresh = vi.fn(async () => {
    return await Promise.resolve(undefined)
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        faKeybinds: { setKeybinds: setKeybindsMock }
      }
    },
    writable: true
  })

  const { runFaKeybindsUpdateKeybinds } = await import('../faKeybindsStoreBridgeUpdate')
  const ok = await runFaKeybindsUpdateKeybinds(
    {
      replaceAllOverrides: true,
      overrides: {}
    },
    refresh
  )

  expect(ok).toBe(true)
  expect(setKeybindsMock).toHaveBeenCalledOnce()
  expect(refresh).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'globalFunctionality.faKeybinds.saveSuccess',
      type: 'positive'
    })
  )
})
