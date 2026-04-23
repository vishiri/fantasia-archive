import {
  beforeEach,
  expect,
  test,
  vi
} from 'vitest'

import { getMonacoKeybindHelpItems } from '../windowProgramStylingKeybindHelp'

const { faKeybindsSnapshotRef, faKeybindsStoreThrow } = vi.hoisted(() => {
  return {
    faKeybindsSnapshotRef: { value: null as null | { platform: NodeJS.Platform } },
    faKeybindsStoreThrow: { value: false }
  }
})

vi.mock('app/src/stores/S_FaKeybinds', () => {
  return {
    S_FaKeybinds: () => {
      if (faKeybindsStoreThrow.value) {
        throw new Error('pinia inactive')
      }
      return {
        get snapshot () {
          return faKeybindsSnapshotRef.value
        }
      }
    }
  }
})

beforeEach(() => {
  faKeybindsStoreThrow.value = false
  faKeybindsSnapshotRef.value = null
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    configurable: true,
    writable: true
  })
})

/**
 * windowProgramStylingKeybindHelp
 * The static row order and i18n label keys must match the entries the window renders, regardless of platform.
 */
test('Test that getMonacoKeybindHelpItems returns the Monaco editor rows in the documented order', () => {
  const items = getMonacoKeybindHelpItems()
  expect(items.map((row) => row.labelKey)).toEqual([
    'commandPalette',
    'triggerSuggestion',
    'find',
    'findReplace',
    'copy',
    'paste',
    'cut',
    'addPadding',
    'removePadding'
  ])
})

/**
 * windowProgramStylingKeybindHelp
 * On Windows / Linux the chord text uses the Ctrl primary modifier and the Find / Replace combo is Ctrl + H.
 */
test('Test that getMonacoKeybindHelpItems uses Ctrl chords on win32 snapshot platforms', () => {
  faKeybindsSnapshotRef.value = { platform: 'win32' }
  const chords = Object.fromEntries(
    getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
  )
  expect(chords.commandPalette).toBe('F1')
  expect(chords.triggerSuggestion).toBe('Ctrl + Space')
  expect(chords.find).toBe('Ctrl + F')
  expect(chords.findReplace).toBe('Ctrl + H')
  expect(chords.copy).toBe('Ctrl + C')
  expect(chords.paste).toBe('Ctrl + V')
  expect(chords.cut).toBe('Ctrl + X')
  expect(chords.addPadding).toBe('Tab')
  expect(chords.removePadding).toBe('Shift + Tab')
})

/**
 * windowProgramStylingKeybindHelp
 * Linux behaves like Windows for these chords (only macOS swaps the primary modifier).
 */
test('Test that getMonacoKeybindHelpItems keeps Ctrl chords on linux snapshot platforms', () => {
  faKeybindsSnapshotRef.value = { platform: 'linux' }
  const chords = Object.fromEntries(
    getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
  )
  expect(chords.find).toBe('Ctrl + F')
  expect(chords.findReplace).toBe('Ctrl + H')
  expect(chords.cut).toBe('Ctrl + X')
})

/**
 * windowProgramStylingKeybindHelp
 * On macOS the primary modifier becomes Cmd, Trigger Suggestion stays Ctrl + Space, and Find and replace becomes Cmd + Opt + F.
 */
test('Test that getMonacoKeybindHelpItems uses Cmd chords on darwin snapshot platforms with the macOS Find and replace combo', () => {
  faKeybindsSnapshotRef.value = { platform: 'darwin' }
  const chords = Object.fromEntries(
    getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
  )
  expect(chords.commandPalette).toBe('F1')
  expect(chords.triggerSuggestion).toBe('Ctrl + Space')
  expect(chords.find).toBe('Cmd + F')
  expect(chords.findReplace).toBe('Cmd + Opt + F')
  expect(chords.copy).toBe('Cmd + C')
  expect(chords.paste).toBe('Cmd + V')
  expect(chords.cut).toBe('Cmd + X')
  expect(chords.addPadding).toBe('Tab')
  expect(chords.removePadding).toBe('Shift + Tab')
})

/**
 * windowProgramStylingKeybindHelp
 * When the keybinds snapshot is null, the helper falls back to a navigator userAgent check; a Mac UA still yields Cmd chords.
 */
test('Test that getMonacoKeybindHelpItems falls back to navigator userAgent when the snapshot is null and detects macOS', () => {
  faKeybindsSnapshotRef.value = null
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)' },
    configurable: true,
    writable: true
  })
  const chords = Object.fromEntries(
    getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
  )
  expect(chords.find).toBe('Cmd + F')
  expect(chords.findReplace).toBe('Cmd + Opt + F')
})

/**
 * windowProgramStylingKeybindHelp
 * When neither the snapshot nor a Mac userAgent is available, the helper defaults to the Ctrl chord set.
 */
test('Test that getMonacoKeybindHelpItems defaults to Ctrl chords when neither snapshot nor Mac userAgent is available', () => {
  faKeybindsSnapshotRef.value = null
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' },
    configurable: true,
    writable: true
  })
  const items = getMonacoKeybindHelpItems()
  const find = items.find((row) => row.labelKey === 'find')
  const replace = items.find((row) => row.labelKey === 'findReplace')
  expect(find?.chord).toBe('Ctrl + F')
  expect(replace?.chord).toBe('Ctrl + H')
})

/**
 * windowProgramStylingKeybindHelp
 * When the snapshot is null and the environment exposes no 'navigator' global, the helper still defaults to the Ctrl chord set.
 */
test('Test that getMonacoKeybindHelpItems uses Ctrl when snapshot is null and navigator is not defined on globalThis', () => {
  faKeybindsSnapshotRef.value = null
  vi.stubGlobal('navigator', undefined)
  try {
    const chords = Object.fromEntries(
      getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
    )
    expect(chords.find).toBe('Ctrl + F')
    expect(chords.findReplace).toBe('Ctrl + H')
  } finally {
    vi.unstubAllGlobals()
  }
})

/**
 * windowProgramStylingKeybindHelp
 * When 'S_FaKeybinds()' throws (no active Pinia), the helper uses the same navigator fallback path.
 */
test('Test that getMonacoKeybindHelpItems falls back to userAgent when the keybinds store getter throws', () => {
  faKeybindsStoreThrow.value = true
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)' },
    configurable: true,
    writable: true
  })
  const chords = Object.fromEntries(
    getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
  )
  expect(chords.find).toBe('Cmd + F')
})

/**
 * windowProgramStylingKeybindHelp
 * When 'navigator.userAgent' is not a string, the Mac regex branch is skipped and Ctrl chords are used.
 */
test('Test that getMonacoKeybindHelpItems ignores non-string userAgent for Mac detection', () => {
  faKeybindsSnapshotRef.value = null
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 0 as unknown as string },
    configurable: true,
    writable: true
  })
  const chords = Object.fromEntries(
    getMonacoKeybindHelpItems().map((row) => [row.labelKey, row.chord])
  )
  expect(chords.find).toBe('Ctrl + F')
})
