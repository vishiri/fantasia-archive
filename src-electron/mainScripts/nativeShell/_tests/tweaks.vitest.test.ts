import os from 'os'
import { tweakRetriveOS } from 'app/src-electron/mainScripts/nativeShell/nativeShell_manager'
import { test, expect, vi } from 'vitest'
import { tweakMenuRemover } from '../nativeShell_manager'

const { setApplicationMenuMock } = vi.hoisted(() => {
  return {
    setApplicationMenuMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    Menu: {
      setApplicationMenu: setApplicationMenuMock
    }
  }
})

/**
 * tweakRetriveOS
 */
test('Test that platform detection works', () => {
  expect(typeof tweakRetriveOS()).toBe('string')
})

/**
 * tweakRetriveOS
 * When process.platform is an empty string, os.platform() supplies the identifier.
 */
test('Test that tweakRetriveOS uses os.platform when process.platform is empty', () => {
  const original = process.platform
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: ''
  })

  expect(tweakRetriveOS()).toBe(os.platform())

  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: original
  })
})

/**
 * tweakMenuRemover
 * Test menu removal call.
 */
test('Test that app window menu removing works', () => {
  tweakMenuRemover()
  expect(setApplicationMenuMock).toHaveBeenCalledWith(null)
})
