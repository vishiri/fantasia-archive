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

/**
 * buildCleanFaKeybindsRoot
 * Drops a known command whose stored chord is not a code plus modifier list.
 */
test('buildCleanFaKeybindsRoot rewrites when a known command chord is invalid', () => {
  const commandId = FA_KEYBIND_COMMAND_IDS[0]
  if (commandId === undefined) {
    throw new Error('missing keybind command id')
  }
  const {
    next,
    shouldRewrite
  } = buildCleanFaKeybindsRoot(
    {
      overrides: {
        [commandId]: {
          code: 'KeyK',
          mods: ['nope']
        }
      },
      schemaVersion: 1
    } as unknown as Parameters<typeof buildCleanFaKeybindsRoot>[0],
    FA_KEYBIND_COMMAND_IDS,
    isFaKeybindCommandId
  )
  expect(shouldRewrite).toBe(true)
  expect(next.overrides).toEqual({})
})
