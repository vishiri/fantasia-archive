import { expect, test } from 'vitest'

import type { I_dialogKeybindSettingsRow } from 'app/types/I_dialogKeybindSettings'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

import { formatDialogKeybindSettingsUserKeybindButtonLabel } from '../dialogKeybindSettingsUserKeybindLabel'

const baseRow: Omit<I_dialogKeybindSettingsRow, 'userShowsAddNewCombo' | 'userChord'> = {
  commandId: 'openProgramSettings',
  defaultLabel: 'd',
  editable: true,
  nameLabel: 'n',
  rowKey: 'k'
}

/**
 * formatDialogKeybindSettingsUserKeybindButtonLabel
 * Shows the add-new label when the row requests a new combo.
 */
test('formatDialogKeybindSettingsUserKeybindButtonLabel returns add-new copy', () => {
  const row: I_dialogKeybindSettingsRow = {
    ...baseRow,
    userChord: null,
    userShowsAddNewCombo: true
  }
  const out = formatDialogKeybindSettingsUserKeybindButtonLabel(
    row,
    {
      formatChord: () => 'should-not-run',
      t: (key: string) => `t:${key}`
    }
  )
  expect(out).toBe('t:dialogs.keybindSettings.addNew')
})

/**
 * formatDialogKeybindSettingsUserKeybindButtonLabel
 * Formats the stored chord when present.
 */
test('formatDialogKeybindSettingsUserKeybindButtonLabel formats an existing chord', () => {
  const chord = {
    code: 'KeyA',
    mods: []
  } as I_faChordSerialized
  const row: I_dialogKeybindSettingsRow = {
    ...baseRow,
    userChord: chord,
    userShowsAddNewCombo: false
  }
  const out = formatDialogKeybindSettingsUserKeybindButtonLabel(
    row,
    {
      formatChord: () => 'Alt+A',
      t: () => 'unused'
    }
  )
  expect(out).toBe('Alt+A')
})

/**
 * formatDialogKeybindSettingsUserKeybindButtonLabel
 * Returns an empty string when there is no chord and no add-new state.
 */
test('formatDialogKeybindSettingsUserKeybindButtonLabel returns empty when idle', () => {
  const row: I_dialogKeybindSettingsRow = {
    ...baseRow,
    userChord: null,
    userShowsAddNewCombo: false
  }
  const out = formatDialogKeybindSettingsUserKeybindButtonLabel(
    row,
    {
      formatChord: () => 'x',
      t: () => 'y'
    }
  )
  expect(out).toBe('')
})
