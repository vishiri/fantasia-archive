/**
 * Covers the defensive branches in keybind conflict lookup and global dispatch that skip
 * command definitions whose resolved effective chord is unset (defaultChord null with no override).
 * Production definitions currently assign every command a default; this file temporarily maps
 * toggleDeveloperTools to null default via a module mock so those branches stay exercised.
 */

/** @vitest-environment jsdom */

import { expect, test, vi } from 'vitest'

const { runCommandMock } = vi.hoisted(() => {
  return {
    runCommandMock: vi.fn()
  }
})

vi.mock('app/src/scripts/keybinds/faKeybindRunCommand', () => {
  return {
    faKeybindRunCommand: (...args: unknown[]) => runCommandMock(...args)
  }
})

vi.mock('app/src/scripts/keybinds/faKeybindCommandDefinitions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/keybinds/faKeybindCommandDefinitions')>()
  return {
    ...actual,
    FA_KEYBIND_COMMAND_DEFINITIONS: actual.FA_KEYBIND_COMMAND_DEFINITIONS.map((d) => {
      if (d.id !== 'toggleDeveloperTools') {
        return { ...d }
      }
      return {
        ...d,
        defaultChord: null
      }
    })
  }
})

import { createFaKeybindKeydownHandler } from 'app/src/scripts/keybinds/faKeybindsGlobalDispatch'
import { faKeybindFindChordConflict } from 'app/src/scripts/keybinds/faKeybindsChordDisplayAndConflict'

/**
 * faKeybindFindChordConflict
 * Iterates definitions; toggleDeveloperTools has no effective chord under the mock.
 */
test('faKeybindFindChordConflict skips definitions whose effective chord is null', () => {
  expect(faKeybindFindChordConflict({
    chord: {
      code: 'KeyZ',
      mods: ['ctrl']
    },
    excludeCommandId: 'openKeybindSettings',
    overrides: {},
    platform: 'win32'
  })).toBeNull()
})

/**
 * createFaKeybindKeydownHandler
 * Same iteration shape as conflict lookup when a definition has no effective chord.
 */
test('createFaKeybindKeydownHandler skips definitions whose effective chord is null', () => {
  runCommandMock.mockReset()
  const handler = createFaKeybindKeydownHandler(() => ({
    overrides: {},
    platform: 'win32',
    suspendGlobalKeybindDispatch: false
  }))
  handler(new KeyboardEvent('keydown', {
    code: 'KeyZ',
    ctrlKey: true,
    key: 'z'
  }))
  expect(runCommandMock).not.toHaveBeenCalled()
})
