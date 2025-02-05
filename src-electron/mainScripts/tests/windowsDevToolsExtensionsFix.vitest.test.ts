import { test } from 'vitest'

/**
 * windowsDevToolsExtensionsFix
 * We cannot test this function as it requires Electron to be running... on top of it, this is a horribly hacky solution to begin with. Don't bother testing this, just pretend it doesn't exist for the sake of your own sanity.
 */
test.skip('Test that electron dev tools bug fix for Windows works')
