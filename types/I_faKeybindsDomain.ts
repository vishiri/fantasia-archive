/**
 * Canonical command ids for global (Electron) keyboard shortcuts.
 */
export const FA_KEYBIND_COMMAND_IDS = [
  'toggleDeveloperTools',
  'openProgramSettings',
  'openKeybindSettings'
] as const

/**
 * Union of supported global shortcut command ids.
 */
export type T_faKeybindCommandId = typeof FA_KEYBIND_COMMAND_IDS[number]

/**
 * Modifier keys as stored on serialized chords (platform-specific resolved literals).
 */
export type T_faKeybindModifierLiteral = 'alt' | 'ctrl' | 'meta' | 'shift'

/**
 * Default chord definitions may use 'primary' to mean the platform primary modifier (Ctrl on Windows/Linux, Command on macOS).
 */
export type T_faKeybindModifierDefault = T_faKeybindModifierLiteral | 'primary'

/**
 * Built-in default shortcut: DOM key code plus normalized modifier list (may include 'primary').
 */
export interface I_faChordDefault {
  code: string
  mods: T_faKeybindModifierDefault[]
}

/**
 * User-facing or persisted shortcut: DOM key code plus concrete modifier literals only.
 */
export interface I_faChordSerialized {
  code: string
  mods: T_faKeybindModifierLiteral[]
}

/**
 * Static metadata for one global shortcut command (default chord, i18n key, editability).
 */
export interface I_faKeybindCommandDefinition {
  defaultChord: I_faChordDefault | null
  editable: boolean
  firesInEditableFields: boolean
  id: T_faKeybindCommandId
  messageKey: string
}

/**
 * Root shape persisted for global keybind overrides in the main-process store.
 */
export interface I_faKeybindsRoot {
  schemaVersion: 1
  overrides: Partial<Record<T_faKeybindCommandId, I_faChordSerialized | null>>
}

/**
 * Snapshot returned to the renderer: persisted store plus the current OS platform string.
 */
export interface I_faKeybindsSnapshot {
  store: I_faKeybindsRoot
  platform: NodeJS.Platform
}

/**
 * Preload bridge for reading and updating persisted global keybind overrides.
 */
export interface I_faKeybindsAPI {
  getKeybinds: () => Promise<I_faKeybindsSnapshot>
  setKeybinds: (patch: {
    overrides?: I_faKeybindsRoot['overrides']
    replaceAllOverrides?: boolean
  }) => Promise<void>
}

/**
 * Reasons a browser keydown event cannot become a captured shortcut chord.
 */
export type T_faKeybindChordFromEventReject =
  | 'modifier_key_alone'
  | 'need_modifier'
  | 'unsupported_key'

/**
 * Outcome of interpreting a capture-phase keydown as a shortcut chord candidate.
 */
export type T_faKeybindTryChordFromEventResult =
  | {
    chord: I_faChordSerialized
    ok: true
  }
  | {
    ok: false
    reason: T_faKeybindChordFromEventReject
  }
