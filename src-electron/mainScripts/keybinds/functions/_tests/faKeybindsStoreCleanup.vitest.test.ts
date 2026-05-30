import { expect, test } from 'vitest'

import { FA_KEYBIND_COMMAND_IDS } from 'app/types/I_faKeybindsDomain'

import { buildCleanFaKeybindsRoot } from '../faKeybindsStoreCleanup'

function isFaKeybindCommandId (key: string): key is typeof FA_KEYBIND_COMMAND_IDS[number] {
  return (FA_KEYBIND_COMMAND_IDS as readonly string[]).includes(key)
}

/**
 * buildCleanFaKeybindsRoot
 * Strips unknown override keys and normalizes schema version.
 */
test('buildCleanFaKeybindsRoot rewrites when override keys are unknown', () => {
  const {
    next,
    shouldRewrite
  } = buildCleanFaKeybindsRoot(
    {
      overrides: {
        notACommand: null
      },
      schemaVersion: 2
    } as unknown as Parameters<typeof buildCleanFaKeybindsRoot>[0],
    FA_KEYBIND_COMMAND_IDS,
    isFaKeybindCommandId
  )
  expect(shouldRewrite).toBe(true)
  expect(next.schemaVersion).toBe(1)
  expect(next.overrides).toEqual({})
})
