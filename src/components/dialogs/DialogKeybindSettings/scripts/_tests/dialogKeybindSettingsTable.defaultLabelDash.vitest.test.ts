/**
 * Exercises the defaultLabel em dash branch in buildDialogKeybindSettingsRows when a command
 * definition has no built-in default chord. Production definitions currently assign every command
 * a default; this file temporarily maps openKeybindSettings to null default via a module mock.
 */

import { expect, test, vi } from 'vitest'

vi.mock('app/src/scripts/keybinds/faKeybindCommandDefinitions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/keybinds/faKeybindCommandDefinitions')>()
  return {
    ...actual,
    FA_KEYBIND_COMMAND_DEFINITIONS: actual.FA_KEYBIND_COMMAND_DEFINITIONS.map((d) => {
      if (d.id !== 'openKeybindSettings') {
        return { ...d }
      }
      return {
        ...d,
        defaultChord: null
      }
    })
  }
})

import { buildDialogKeybindSettingsRows } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTable'

/**
 * buildDialogKeybindSettingsRows
 * defaultLabel is an em dash when faKeybindExpandDefaultChord yields null.
 */
test('buildDialogKeybindSettingsRows shows em dash default label when definition has no default chord', () => {
  const rows = buildDialogKeybindSettingsRows({
    overrides: {},
    platform: 'win32',
    t: (k: string) => k
  })
  const keybindRow = rows.find((r) => r.commandId === 'openKeybindSettings')
  expect(keybindRow?.defaultLabel).toBe('—')
})
