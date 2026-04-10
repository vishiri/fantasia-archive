import { test, expect, vi, beforeEach } from 'vitest'
import { windowsDevToolsExtensionsFix } from '../windowsDevToolsExtensionsFix'
import path from 'path'

const { appMock, nativeThemeMock, existsSyncMock, unlinkSyncMock } = vi.hoisted(() => {
  return {
    appMock: {
      getPath: vi.fn(() => 'C:/Users/test/AppData/Roaming/fantasia-archive')
    },
    nativeThemeMock: {
      shouldUseDarkColors: false
    },
    existsSyncMock: vi.fn(() => false),
    unlinkSyncMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    app: appMock,
    nativeTheme: nativeThemeMock
  }
})

vi.mock('fs', () => {
  return {
    default: {
      existsSync: existsSyncMock,
      unlinkSync: unlinkSyncMock
    }
  }
})

beforeEach(() => {
  nativeThemeMock.shouldUseDarkColors = false
  existsSyncMock.mockReset()
  unlinkSyncMock.mockReset()
  appMock.getPath.mockClear()
})

/**
 * windowsDevToolsExtensionsFix
 * Test platform and theme branches for deleting stale extensions file.
 */
test('Test that electron dev tools bug fix for Windows works', () => {
  const expectedPath = path.join('C:/Users/test/AppData/Roaming/fantasia-archive', 'DevTools Extensions')

  windowsDevToolsExtensionsFix('linux')
  expect(existsSyncMock).not.toHaveBeenCalled()

  nativeThemeMock.shouldUseDarkColors = false
  windowsDevToolsExtensionsFix('win32')
  expect(existsSyncMock).not.toHaveBeenCalled()

  nativeThemeMock.shouldUseDarkColors = true
  existsSyncMock.mockReturnValueOnce(false)
  windowsDevToolsExtensionsFix('win32')
  expect(existsSyncMock).toHaveBeenCalledWith(expectedPath)
  expect(unlinkSyncMock).not.toHaveBeenCalled()

  existsSyncMock.mockReturnValueOnce(true)
  windowsDevToolsExtensionsFix('win32')
  expect(unlinkSyncMock).toHaveBeenCalledWith(expectedPath)
})
