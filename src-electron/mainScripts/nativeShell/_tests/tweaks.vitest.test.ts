import os from 'os'
import { tweakRetriveOS } from 'app/src-electron/mainScripts/nativeShell/tweaks'
import { expectTypeOf, test, expect, vi } from 'vitest'
import { tweakMenuRemover } from '../tweaks'

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
  expectTypeOf(tweakRetriveOS()).toEqualTypeOf(process.platform || os.platform())
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
