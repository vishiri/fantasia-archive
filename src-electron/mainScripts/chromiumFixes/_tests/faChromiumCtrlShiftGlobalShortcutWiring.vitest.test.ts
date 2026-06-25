import { afterEach, expect, test, vi } from 'vitest'

import type { WebContents } from 'electron'

const globalShortcutRegisterMock = vi.hoisted(() =>
  vi.fn<(accelerator: string, callback: () => void) => boolean>(() => true)
)
const globalShortcutUnregisterMock = vi.hoisted(() => vi.fn())
const globalShortcutIsRegisteredMock = vi.hoisted(() =>
  vi.fn<(accelerator: string) => boolean>(() => false)
)

vi.mock('electron', () => {
  return {
    globalShortcut: {
      isRegistered: globalShortcutIsRegisteredMock,
      register: globalShortcutRegisterMock,
      unregister: globalShortcutUnregisterMock
    }
  }
})

import * as faChromiumDomCodeToGlobalShortcutAcceleratorModule from '../functions/faChromiumDomCodeToGlobalShortcutAccelerator'
import { createFaChromiumCtrlShiftGlobalShortcutForwardController } from '../faChromiumCtrlShiftGlobalShortcutWiring'

afterEach(() => {
  vi.unstubAllEnvs()
  globalShortcutRegisterMock.mockClear()
  globalShortcutRegisterMock.mockReturnValue(true)
  globalShortcutUnregisterMock.mockClear()
  globalShortcutIsRegisteredMock.mockReturnValue(false)
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * Nothing is registered before 'activate'; 'activate' claims accelerators and forwards on press.
 */
test('Test that activate registers accelerators and forwards the DOM code on press', () => {
  const executeJavaScript = vi.fn<(script: string) => Promise<unknown>>(() => Promise.resolve(undefined))
  const wc = {
    executeJavaScript,
    isDestroyed: () => false
  }
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController(wc as unknown as WebContents)

  expect(controller.globallyForwardedDomCodes.size).toBe(0)
  expect(globalShortcutRegisterMock).not.toHaveBeenCalled()

  controller.activate()

  expect(controller.globallyForwardedDomCodes.has('KeyO')).toBe(true)
  expect(globalShortcutRegisterMock.mock.calls.some((call) => call[0]! === 'CommandOrControl+Shift+O')).toBe(
    true
  )

  const oRegistrationIndex = globalShortcutRegisterMock.mock.calls.findIndex(
    (call) => call[0]! === 'CommandOrControl+Shift+O'
  )
  expect(oRegistrationIndex).toBeGreaterThanOrEqual(0)
  const onPress = globalShortcutRegisterMock.mock.calls[oRegistrationIndex]![1]!
  onPress()

  expect(executeJavaScript).toHaveBeenCalledOnce()
  expect(String(executeJavaScript.mock.calls[0]![0]!)).toContain('KeyO')
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * activate is a no-op inside the Playwright harness so component/e2e specs never claim shortcuts.
 */
test('Test that activate skips registration in the Playwright harness', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({} as WebContents)
  controller.activate()
  expect(controller.globallyForwardedDomCodes.size).toBe(0)
  expect(globalShortcutRegisterMock).not.toHaveBeenCalled()
  expect(() => controller.deactivate()).not.toThrow()
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * No DOM codes are forwarded when every globalShortcut.register call fails.
 */
test('Test that activate reports no forwarded codes when globalShortcut.register fails', () => {
  globalShortcutRegisterMock.mockReturnValue(false)
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  controller.activate()

  expect(controller.globallyForwardedDomCodes.size).toBe(0)
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * A chord whose accelerator is taken by another app is omitted while the rest still register.
 */
test('Test that activate omits KeyO when CommandOrControl+Shift+O is taken', () => {
  globalShortcutRegisterMock.mockImplementation((accelerator: string) => {
    return accelerator !== 'CommandOrControl+Shift+O' && accelerator !== 'Control+Shift+O'
  })
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  controller.activate()

  expect(controller.globallyForwardedDomCodes.size).toBe(11)
  expect(controller.globallyForwardedDomCodes.has('KeyO')).toBe(false)
  expect(controller.globallyForwardedDomCodes.has('KeyB')).toBe(true)
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * DOM codes that do not map to an accelerator are skipped entirely.
 */
test('Test that activate skips accelerators that do not map from a DOM code', () => {
  const acceleratorSpy = vi
    .spyOn(
      faChromiumDomCodeToGlobalShortcutAcceleratorModule,
      'faChromiumDomCodeToGlobalShortcutAccelerator'
    )
    .mockImplementation((domCode: string): string | null => {
      if (domCode === 'KeyO') {
        return 'CommandOrControl+Shift+O'
      }
      return null
    })

  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)
  controller.activate()

  expect(globalShortcutRegisterMock).toHaveBeenCalledTimes(1)
  expect(globalShortcutRegisterMock.mock.calls[0]![0]!).toBe('CommandOrControl+Shift+O')

  acceleratorSpy.mockRestore()
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * A globalShortcut press is ignored when the webContents is already destroyed.
 */
test('Test that a globalShortcut press is ignored when webContents is destroyed', () => {
  const executeJavaScript = vi.fn()
  const wc = {
    executeJavaScript,
    isDestroyed: () => true
  }

  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController(wc as unknown as WebContents)
  controller.activate()

  const registration = globalShortcutRegisterMock.mock.calls.find(
    (call) => call[0]! === 'CommandOrControl+Shift+O'
  )
  registration?.[1]!()

  expect(executeJavaScript).not.toHaveBeenCalled()
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * deactivate releases every claimed accelerator and clears the forwarded DOM-code set.
 */
test('Test that deactivate unregisters claimed accelerators and clears the forwarded set', () => {
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  controller.activate()
  expect(controller.globallyForwardedDomCodes.size).toBeGreaterThan(0)

  globalShortcutIsRegisteredMock.mockReturnValue(true)
  controller.deactivate()

  expect(globalShortcutUnregisterMock).toHaveBeenCalled()
  expect(controller.globallyForwardedDomCodes.size).toBe(0)
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * deactivate does not unregister accelerators that are no longer registered.
 */
test('Test that deactivate skips unregister when an accelerator is not registered', () => {
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  controller.activate()
  globalShortcutUnregisterMock.mockClear()
  globalShortcutIsRegisteredMock.mockReturnValue(false)
  controller.deactivate()

  expect(globalShortcutUnregisterMock).not.toHaveBeenCalled()
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * The literal Control+ fallback is claimed when CommandOrControl+ cannot register.
 */
test('Test that activate retries the Control+ accelerator when CommandOrControl+ fails', () => {
  globalShortcutIsRegisteredMock.mockImplementation((accelerator: string) => {
    return accelerator === 'Control+Shift+O'
  })
  globalShortcutRegisterMock.mockImplementation((accelerator: string) => {
    return accelerator === 'Control+Shift+O'
  })
  const executeJavaScript = vi.fn<(script: string) => Promise<unknown>>(() => Promise.resolve(undefined))
  const wc = {
    executeJavaScript,
    isDestroyed: () => false
  }

  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController(wc as unknown as WebContents)
  controller.activate()

  expect(controller.globallyForwardedDomCodes.has('KeyO')).toBe(true)
  expect(globalShortcutRegisterMock).toHaveBeenCalledWith(
    'CommandOrControl+Shift+O',
    expect.any(Function)
  )
  expect(globalShortcutRegisterMock).toHaveBeenCalledWith(
    'Control+Shift+O',
    expect.any(Function)
  )
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * An already-registered accelerator is unregistered before activate re-registers it.
 */
test('Test that activate unregisters an existing accelerator before registering', () => {
  globalShortcutIsRegisteredMock.mockReturnValue(true)

  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    executeJavaScript: vi.fn(),
    isDestroyed: () => false
  } as unknown as WebContents)
  controller.activate()

  expect(globalShortcutUnregisterMock).toHaveBeenCalled()
})

/**
 * createFaChromiumCtrlShiftGlobalShortcutForwardController
 * Re-running activate releases the previous claim first so accelerators never accumulate.
 */
test('Test that activate is idempotent and releases the previous registration first', () => {
  const controller = createFaChromiumCtrlShiftGlobalShortcutForwardController({
    executeJavaScript: vi.fn(),
    isDestroyed: () => false
  } as unknown as WebContents)

  controller.activate()
  const firstSize = controller.globallyForwardedDomCodes.size
  expect(firstSize).toBeGreaterThan(0)

  globalShortcutIsRegisteredMock.mockReturnValue(true)
  globalShortcutUnregisterMock.mockClear()
  controller.activate()

  expect(globalShortcutUnregisterMock).toHaveBeenCalled()
  expect(controller.globallyForwardedDomCodes.size).toBe(firstSize)
})
