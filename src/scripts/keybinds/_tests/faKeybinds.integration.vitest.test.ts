/** @vitest-environment jsdom */

/**
 * Cross-module renderer keybind flows: global dispatch (keydown), chord helpers, command definitions, and related mocks.
 * Narrow tests for 'getFaKeybindKeydownContext' live in 'faKeybindsGlobalDispatch.getFaKeybindKeydownContext.vitest.test.ts'.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

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
  const defs = actual.FA_KEYBIND_COMMAND_DEFINITIONS.map((d) => {
    return { ...d }
  })
  const program = defs.find((d) => d.id === 'openProgramSettings')
  if (program !== undefined) {
    program.firesInEditableFields = false
  }
  return {
    ...actual,
    FA_KEYBIND_COMMAND_DEFINITIONS: defs
  }
})

import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

import { FA_KEYBIND_COMMAND_DEFINITIONS, findFaKeybindCommandDefinition } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { faKeybindFindChordConflict } from 'app/src/scripts/keybinds/faKeybindsChordDisplayAndConflict'
import { formatFaKeybindChordForUi } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import {
  faKeybindChordsEqual,
  faKeybindExpandDefaultChord,
  faKeybindResolveEffectiveChord,
  sortFaKeybindMods
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import {
  faKeybindEventToChord,
  faKeybindTryChordFromEvent
} from 'app/src/scripts/keybinds/faKeybindsChordFromEvent'
import {
  createFaKeybindKeydownHandler,
  faKeybindIsEditableTarget
} from 'app/src/scripts/keybinds/faKeybindsGlobalDispatch'

beforeEach(() => {
  runCommandMock.mockReset()
})

afterEach(() => {
  vi.clearAllMocks()
})

test('sortFaKeybindMods deduplicates and orders modifiers', () => {
  expect(sortFaKeybindMods([
    'shift',
    'ctrl',
    'shift'
  ])).toEqual([
    'ctrl',
    'shift'
  ])
})

test('faKeybindChordsEqual compares code and mods order-independently', () => {
  const a: I_faChordSerialized = {
    code: 'KeyA',
    mods: [
      'ctrl',
      'shift'
    ]
  }
  const b: I_faChordSerialized = {
    code: 'KeyA',
    mods: [
      'shift',
      'ctrl'
    ]
  }
  expect(faKeybindChordsEqual(a, b)).toBe(true)
  expect(faKeybindChordsEqual(a, {
    code: 'KeyB',
    mods: ['ctrl']
  })).toBe(false)
})

test('faKeybindChordsEqual is false when modifier counts differ for the same code', () => {
  const oneMod: I_faChordSerialized = {
    code: 'KeyA',
    mods: ['ctrl']
  }
  const twoMods: I_faChordSerialized = {
    code: 'KeyA',
    mods: [
      'ctrl',
      'shift'
    ]
  }
  expect(faKeybindChordsEqual(oneMod, twoMods)).toBe(false)
})

test('faKeybindExpandDefaultChord maps primary per platform and returns null for null default', () => {
  expect(faKeybindExpandDefaultChord(null, 'win32')).toBeNull()
  const darwin = faKeybindExpandDefaultChord({
    code: 'KeyQ',
    mods: ['primary']
  }, 'darwin')
  expect(darwin?.mods).toContain('meta')
  const win = faKeybindExpandDefaultChord({
    code: 'KeyQ',
    mods: ['primary']
  }, 'win32')
  expect(win?.mods).toContain('ctrl')
})

test('faKeybindResolveEffectiveChord uses override, null revert, or default', () => {
  const base = {
    commandId: 'openProgramSettings' as const,
    defaultChord: {
      code: 'Comma',
      mods: ['primary' as const]
    },
    platform: 'win32' as const
  }
  const custom = {
    code: 'KeyZ',
    mods: ['alt' as const]
  }
  expect(faKeybindResolveEffectiveChord({
    ...base,
    overrides: { openProgramSettings: custom }
  })).toEqual(custom)
  expect(faKeybindResolveEffectiveChord({
    ...base,
    overrides: { openProgramSettings: null }
  })?.code).toBe('Comma')
  expect(faKeybindResolveEffectiveChord({
    ...base,
    overrides: {}
  })?.code).toBe('Comma')
})

test('formatFaKeybindChordForUi covers modifier platforms and code labels', () => {
  const chord: I_faChordSerialized = {
    code: 'KeyQ',
    mods: [
      'meta',
      'shift'
    ]
  }
  expect(formatFaKeybindChordForUi(chord, 'darwin')).toContain('Cmd')
  expect(formatFaKeybindChordForUi(chord, 'win32')).toContain('Meta')
  expect(formatFaKeybindChordForUi({
    code: 'Digit1',
    mods: ['alt']
  }, 'win32')).toContain('Alt')
  expect(formatFaKeybindChordForUi({
    code: 'Digit1',
    mods: ['alt']
  }, 'darwin')).toContain('Opt')
  expect(formatFaKeybindChordForUi({
    code: 'ArrowLeft',
    mods: ['ctrl']
  }, 'win32')).toContain('arrow')
  expect(formatFaKeybindChordForUi({
    code: 'Comma',
    mods: []
  }, 'win32')).toContain(',')
  expect(formatFaKeybindChordForUi({
    code: 'F1',
    mods: []
  }, 'win32')).toContain('F1')
  expect(formatFaKeybindChordForUi({
    code: 'UnknownCode',
    mods: ['shift']
  }, 'win32')).toContain('UnknownCode')
})

test('faKeybindFindChordConflict returns a different command sharing the chord', () => {
  const shared = {
    code: 'KeyX',
    mods: ['ctrl' as const]
  }
  const conflict = faKeybindFindChordConflict({
    chord: shared,
    excludeCommandId: 'toggleDeveloperTools',
    overrides: {
      openProgramSettings: shared,
      toggleDeveloperTools: {
        code: 'KeyI',
        mods: [
          'alt',
          'ctrl',
          'shift'
        ]
      }
    },
    platform: 'win32'
  })
  expect(conflict).toBe('openProgramSettings')
})

test('faKeybindFindChordConflict returns null when no command owns the chord', () => {
  const none = faKeybindFindChordConflict({
    chord: {
      code: 'KeyZ',
      mods: ['ctrl']
    },
    excludeCommandId: 'openProgramSettings',
    overrides: {},
    platform: 'win32'
  })
  expect(none).toBeNull()
})

test('faKeybindFindChordConflict uses effective chords so a superseded default no longer blocks', () => {
  const ctrlAltShiftL = {
    code: 'KeyL',
    mods: [
      'ctrl' as const,
      'alt' as const,
      'shift' as const
    ]
  }
  const ctrlX = {
    code: 'KeyX',
    mods: ['ctrl' as const]
  }
  const blocked = faKeybindFindChordConflict({
    chord: ctrlAltShiftL,
    excludeCommandId: 'openKeybindSettings',
    overrides: {},
    platform: 'win32'
  })
  expect(blocked).toBe('openProgramSettings')

  const freed = faKeybindFindChordConflict({
    chord: ctrlAltShiftL,
    excludeCommandId: 'openKeybindSettings',
    overrides: {
      openProgramSettings: ctrlX
    },
    platform: 'win32'
  })
  expect(freed).toBeNull()
})

test('faKeybindEventToChord returns null without modifiers for letter keys', () => {
  const ev = new KeyboardEvent('keydown', {
    code: 'KeyA',
    key: 'a'
  })
  expect(faKeybindEventToChord(ev)).toBeNull()
  expect(faKeybindTryChordFromEvent(ev)).toEqual({
    ok: false,
    reason: 'need_modifier'
  })
})

test('faKeybindTryChordFromEvent rejects bare modifier physical keys', () => {
  const shiftOnly = new KeyboardEvent('keydown', {
    code: 'ShiftLeft',
    key: 'Shift',
    shiftKey: true
  })
  expect(faKeybindTryChordFromEvent(shiftOnly)).toEqual({
    ok: false,
    reason: 'modifier_key_alone'
  })
  const ctrlOnly = new KeyboardEvent('keydown', {
    code: 'ControlRight',
    ctrlKey: true,
    key: 'Control'
  })
  expect(faKeybindTryChordFromEvent(ctrlOnly)).toEqual({
    ok: false,
    reason: 'modifier_key_alone'
  })
})

test('faKeybindTryChordFromEvent accepts arrow keys with a modifier and rejects numpad-only codes', () => {
  const arrow = new KeyboardEvent('keydown', {
    code: 'ArrowDown',
    ctrlKey: true,
    key: 'ArrowDown'
  })
  expect(faKeybindTryChordFromEvent(arrow)).toEqual({
    chord: {
      code: 'ArrowDown',
      mods: ['ctrl']
    },
    ok: true
  })
  const numpad = new KeyboardEvent('keydown', {
    code: 'NumpadEnter',
    ctrlKey: true,
    key: 'Enter'
  })
  expect(faKeybindTryChordFromEvent(numpad)).toEqual({
    ok: false,
    reason: 'unsupported_key'
  })
})

test('faKeybindTryChordFromEvent requires a modifier for bare arrow keys', () => {
  const arrowBare = new KeyboardEvent('keydown', {
    code: 'ArrowUp',
    key: 'ArrowUp'
  })
  expect(faKeybindTryChordFromEvent(arrowBare)).toEqual({
    ok: false,
    reason: 'need_modifier'
  })
})

test('faKeybindTryChordFromEvent requires a modifier for comma and similar punctuation', () => {
  const commaBare = new KeyboardEvent('keydown', {
    code: 'Comma',
    key: ','
  })
  expect(faKeybindTryChordFromEvent(commaBare)).toEqual({
    ok: false,
    reason: 'need_modifier'
  })
})

test('faKeybindEventToChord allows bare function keys', () => {
  const ev = new KeyboardEvent('keydown', {
    code: 'F2',
    key: 'F2'
  })
  expect(faKeybindEventToChord(ev)?.code).toBe('F2')
})

test('faKeybindEventToChord reads AltGraph as a single alt modifier', () => {
  const ev = new KeyboardEvent('keydown', {
    code: 'KeyE',
    key: 'e'
  })
  vi.spyOn(ev, 'getModifierState').mockReturnValue(true)
  const chord = faKeybindEventToChord(ev)
  expect(chord?.mods).toEqual(['alt'])
})

test('faKeybindEventToChord maps literal modifiers when AltGraph is inactive', () => {
  const ev = new KeyboardEvent('keydown', {
    altKey: true,
    code: 'KeyX',
    ctrlKey: true,
    key: 'x',
    metaKey: true,
    shiftKey: true
  })
  vi.spyOn(ev, 'getModifierState').mockReturnValue(false)
  const chord = faKeybindEventToChord(ev)
  expect(chord?.mods).toEqual([
    'ctrl',
    'meta',
    'alt',
    'shift'
  ])
})

test('faKeybindIsEditableTarget detects inputs and contenteditable', () => {
  expect(faKeybindIsEditableTarget(null)).toBe(false)
  expect(faKeybindIsEditableTarget(document as unknown as EventTarget)).toBe(false)
  const input = document.createElement('input')
  expect(faKeybindIsEditableTarget(input)).toBe(true)
  const textarea = document.createElement('textarea')
  expect(faKeybindIsEditableTarget(textarea)).toBe(true)
  const select = document.createElement('select')
  expect(faKeybindIsEditableTarget(select)).toBe(true)
  const div = document.createElement('div')
  div.setAttribute('contenteditable', 'true')
  expect(faKeybindIsEditableTarget(div)).toBe(true)
  const editableDiv = document.createElement('div')
  Object.defineProperty(editableDiv, 'isContentEditable', {
    configurable: true,
    get () {
      return true
    }
  })
  expect(faKeybindIsEditableTarget(editableDiv)).toBe(true)
  const host = document.createElement('div')
  host.setAttribute('contenteditable', 'true')
  const nested = document.createElement('span')
  host.appendChild(nested)
  Object.defineProperty(nested, 'isContentEditable', {
    configurable: true,
    get () {
      return false
    }
  })
  expect(faKeybindIsEditableTarget(nested)).toBe(true)
  expect(faKeybindIsEditableTarget(document.createElement('div'))).toBe(false)
})

test('createFaKeybindKeydownHandler skips repeat, composing, suspend, and editable mismatch', () => {
  const preventDefault = vi.fn()
  const stopPropagation = vi.fn()
  const getContext = vi.fn(() => ({
    overrides: {},
    platform: 'win32' as const,
    suspendGlobalKeybindDispatch: false
  }))
  const handler = createFaKeybindKeydownHandler(getContext)

  const asKeyEvent = (target: EventTarget | null): KeyboardEvent => {
    return {
      altKey: true,
      code: 'KeyL',
      ctrlKey: true,
      isComposing: false,
      key: 'l',
      preventDefault,
      repeat: false,
      shiftKey: true,
      stopPropagation,
      target
    } as unknown as KeyboardEvent
  }

  const repeatEv = new KeyboardEvent('keydown', {
    altKey: true,
    code: 'KeyL',
    ctrlKey: true,
    key: 'l',
    repeat: true,
    shiftKey: true
  })
  handler(repeatEv as KeyboardEvent)
  expect(runCommandMock).not.toHaveBeenCalled()

  const composingEv = new KeyboardEvent('keydown', {
    altKey: true,
    code: 'KeyL',
    ctrlKey: true,
    shiftKey: true
  })
  Object.defineProperty(composingEv, 'isComposing', { value: true })
  handler(composingEv)
  expect(runCommandMock).not.toHaveBeenCalled()

  getContext.mockReturnValueOnce({
    overrides: {},
    platform: 'win32',
    suspendGlobalKeybindDispatch: true
  })
  handler(asKeyEvent(document.body))
  expect(runCommandMock).not.toHaveBeenCalled()

  getContext.mockImplementation(() => ({
    overrides: {},
    platform: 'win32',
    suspendGlobalKeybindDispatch: false
  }))

  handler(asKeyEvent(document.createElement('input')))
  expect(runCommandMock).not.toHaveBeenCalled()

  handler(asKeyEvent(document.body))
  expect(runCommandMock).toHaveBeenCalledWith('openProgramSettings')
  expect(preventDefault).toHaveBeenCalled()
  expect(stopPropagation).toHaveBeenCalled()
})

test('createFaKeybindKeydownHandler does nothing when normalized chord is null', () => {
  const handler = createFaKeybindKeydownHandler(() => ({
    overrides: {},
    platform: 'win32',
    suspendGlobalKeybindDispatch: false
  }))
  const ev = new KeyboardEvent('keydown', {
    code: 'KeyB',
    key: 'b'
  })
  handler(ev)
  expect(runCommandMock).not.toHaveBeenCalled()
})

test('findFaKeybindCommandDefinition returns undefined for unknown ids', () => {
  expect(findFaKeybindCommandDefinition('openProgramSettings')).toBeDefined()
  // @ts-expect-error — deliberate unknown id for runtime guard coverage
  expect(findFaKeybindCommandDefinition('notARealCommand')).toBeUndefined()
})

test('FA_KEYBIND_COMMAND_DEFINITIONS lists expected commands', () => {
  expect(FA_KEYBIND_COMMAND_DEFINITIONS.map((d) => d.id).sort()).toEqual([
    'openActionMonitor',
    'openAdvancedSearchGuide',
    'openKeybindSettings',
    'openProgramSettings',
    'openProgramStyling',
    'toggleDeveloperTools'
  ])
})
