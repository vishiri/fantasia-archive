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
import { registerFaChromiumCtrlShiftGlobalShortcutForward } from '../faChromiumCtrlShiftGlobalShortcutWiring'

afterEach(() => {
  vi.unstubAllEnvs()
  globalShortcutRegisterMock.mockClear()
  globalShortcutRegisterMock.mockReturnValue(true)
  globalShortcutUnregisterMock.mockClear()
  globalShortcutIsRegisteredMock.mockReturnValue(false)
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward registers accelerators and forwards on press', () => {
  const executeJavaScript = vi.fn<(script: string) => Promise<unknown>>(() => Promise.resolve(undefined))
  const wc = {
    executeJavaScript,
    isDestroyed: () => false
  }
  const result = registerFaChromiumCtrlShiftGlobalShortcutForward(wc as unknown as WebContents)

  expect(result.usesGlobalShortcutForward).toBe(true)
  expect(result.globallyForwardedDomCodes.has('KeyO')).toBe(true)
  expect(globalShortcutRegisterMock.mock.calls.some((call) => call[0] === 'CommandOrControl+Shift+O')).toBe(
    true
  )

  const oRegistrationIndex = globalShortcutRegisterMock.mock.calls.findIndex(
    (call) => call[0] === 'CommandOrControl+Shift+O'
  )
  expect(oRegistrationIndex).toBeGreaterThanOrEqual(0)
  const onPress = globalShortcutRegisterMock.mock.calls[oRegistrationIndex][1]
  onPress()

  expect(executeJavaScript).toHaveBeenCalledOnce()
  expect(String(executeJavaScript.mock.calls[0][0])).toContain('KeyO')
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward skips registration in Playwright harness', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  const result = registerFaChromiumCtrlShiftGlobalShortcutForward({} as WebContents)
  expect(result.usesGlobalShortcutForward).toBe(false)
  expect(globalShortcutRegisterMock).not.toHaveBeenCalled()
  expect(() => result.unregister()).not.toThrow()
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward reports no forward when globalShortcut.register fails', () => {
  globalShortcutRegisterMock.mockReturnValue(false)
  const result = registerFaChromiumCtrlShiftGlobalShortcutForward({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  expect(result.usesGlobalShortcutForward).toBe(false)
  expect(result.globallyForwardedDomCodes.size).toBe(0)
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward omits KeyO when CommandOrControl+Shift+O is taken', () => {
  globalShortcutRegisterMock.mockImplementation((accelerator: string) => {
    return accelerator !== 'CommandOrControl+Shift+O' && accelerator !== 'Control+Shift+O'
  })
  const result = registerFaChromiumCtrlShiftGlobalShortcutForward({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  expect(result.globallyForwardedDomCodes.size).toBe(11)
  expect(result.globallyForwardedDomCodes.has('KeyO')).toBe(false)
  expect(result.globallyForwardedDomCodes.has('KeyB')).toBe(true)
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward skips accelerators that do not map from DOM code', () => {
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

  registerFaChromiumCtrlShiftGlobalShortcutForward({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  expect(globalShortcutRegisterMock).toHaveBeenCalledTimes(1)
  expect(globalShortcutRegisterMock.mock.calls[0][0]).toBe('CommandOrControl+Shift+O')

  acceleratorSpy.mockRestore()
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward ignores press when webContents is destroyed', () => {
  const executeJavaScript = vi.fn()
  const wc = {
    executeJavaScript,
    isDestroyed: () => true
  }

  registerFaChromiumCtrlShiftGlobalShortcutForward(wc as unknown as WebContents)

  const registration = globalShortcutRegisterMock.mock.calls.find(
    (call) => call[0] === 'CommandOrControl+Shift+O'
  )
  registration?.[1]()

  expect(executeJavaScript).not.toHaveBeenCalled()
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward unregisters accelerators on cleanup', () => {
  globalShortcutIsRegisteredMock.mockReturnValue(true)
  const result = registerFaChromiumCtrlShiftGlobalShortcutForward({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  result.unregister()

  expect(globalShortcutUnregisterMock).toHaveBeenCalled()
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward skips unregister when accelerator is not registered', () => {
  globalShortcutIsRegisteredMock.mockReturnValue(false)
  const result = registerFaChromiumCtrlShiftGlobalShortcutForward({
    isDestroyed: () => false,
    send: vi.fn()
  } as unknown as WebContents)

  result.unregister()

  expect(globalShortcutUnregisterMock).not.toHaveBeenCalled()
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward retries Control+ accelerator when CommandOrControl+ fails', () => {
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

  const result = registerFaChromiumCtrlShiftGlobalShortcutForward(wc as unknown as WebContents)

  expect(result.globallyForwardedDomCodes.has('KeyO')).toBe(true)
  expect(globalShortcutRegisterMock).toHaveBeenCalledWith(
    'CommandOrControl+Shift+O',
    expect.any(Function)
  )
  expect(globalShortcutRegisterMock).toHaveBeenCalledWith(
    'Control+Shift+O',
    expect.any(Function)
  )
})

test('registerFaChromiumCtrlShiftGlobalShortcutForward unregisters an existing accelerator before register', () => {
  globalShortcutIsRegisteredMock.mockReturnValue(true)

  registerFaChromiumCtrlShiftGlobalShortcutForward({
    executeJavaScript: vi.fn(),
    isDestroyed: () => false
  } as unknown as WebContents)

  expect(globalShortcutUnregisterMock).toHaveBeenCalled()
})
