import os from 'os'
import { tweakRetriveOS } from 'src-electron/mainScripts/tweaks'
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
 * tweakMenuRemover
 * Test menu removal call.
 */
test('Test that app window menu removing works', () => {
  tweakMenuRemover()
  expect(setApplicationMenuMock).toHaveBeenCalledWith(null)
})
