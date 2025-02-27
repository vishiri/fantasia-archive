import os from 'os'
import { tweakRetriveOS } from 'src-electron/mainScripts/tweaks'
import { expectTypeOf, test } from 'vitest'

/**
 * tweakRetriveOS
 */
test('Test that platform detection works', () => {
  expectTypeOf(tweakRetriveOS()).toEqualTypeOf(process.platform || os.platform())
})

/**
 * tweakMenuRemover
 * We cannot test this function as it requires Electron to be running.
 */
test.skip('Test that app window menu removing works')
