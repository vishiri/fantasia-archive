import { expect, test } from 'vitest'

import { buildMonacoKeybindHelpItems } from '../scripts/functions/buildMonacoKeybindHelpItems'

test('buildMonacoKeybindHelpItems returns Ctrl chords on non-Mac platforms', () => {
  const chords = Object.fromEntries(
    buildMonacoKeybindHelpItems(false).map((row) => [row.labelKey, row.chord])
  )
  expect(chords.find).toBe('Ctrl + F')
  expect(chords.findReplace).toBe('Ctrl + H')
})

test('buildMonacoKeybindHelpItems returns Cmd chords on Mac platforms', () => {
  const chords = Object.fromEntries(
    buildMonacoKeybindHelpItems(true).map((row) => [row.labelKey, row.chord])
  )
  expect(chords.find).toBe('Cmd + F')
  expect(chords.findReplace).toBe('Cmd + Opt + F')
})
