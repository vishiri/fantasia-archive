import type {
  I_faChordSerialized,
  I_faKeybindsRoot,
  T_faKeybindCommandId,
  T_faKeybindModifierLiteral
} from 'app/types/I_faKeybindsDomain'

const FA_KEYBIND_MODIFIER_LITERALS: readonly T_faKeybindModifierLiteral[] = [
  'alt',
  'ctrl',
  'meta',
  'shift'
]

function isFaKeybindModifierLiteral (value: unknown): value is T_faKeybindModifierLiteral {
  return FA_KEYBIND_MODIFIER_LITERALS.some((modifier) => modifier === value)
}

function readCleanFaChordSerialized (value: unknown): I_faChordSerialized | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  if (typeof record.code !== 'string' || record.code.length === 0) {
    return null
  }
  if (!Array.isArray(record.mods) || !record.mods.every(isFaKeybindModifierLiteral)) {
    return null
  }
  const code = record.code
  const mods = record.mods
  return {
    code,
    mods
  }
}

export function buildCleanFaKeybindsRoot (
  raw: Partial<I_faKeybindsRoot> & Record<string, unknown>,
  commandIds: readonly T_faKeybindCommandId[],
  isFaKeybindCommandId: (key: string) => key is T_faKeybindCommandId
): {
    next: I_faKeybindsRoot
    shouldRewrite: boolean
  } {
  const rawOverrides = raw.overrides
  const fromDiskRaw = typeof rawOverrides === 'object' && rawOverrides !== null && !Array.isArray(rawOverrides)
    ? rawOverrides as Record<string, unknown>
    : {}

  const overrides: I_faKeybindsRoot['overrides'] = {}
  let droppedInvalidChord = false
  for (const id of commandIds) {
    if (!Object.prototype.hasOwnProperty.call(fromDiskRaw, id)) {
      continue
    }
    const v = fromDiskRaw[id]
    if (v === null) {
      overrides[id] = null
      continue
    }
    const chord = readCleanFaChordSerialized(v)
    if (chord === null) {
      droppedInvalidChord = true
      continue
    }
    overrides[id] = chord
  }

  const next: I_faKeybindsRoot = {
    overrides,
    schemaVersion: 1
  }

  const unexpectedTop = Object.keys(raw).some((k) => k !== 'schemaVersion' && k !== 'overrides')
  const unexpectedOverrideKeys = Object.keys(fromDiskRaw).some((k) => {
    return !isFaKeybindCommandId(k)
  })

  const shouldRewrite = unexpectedTop ||
    unexpectedOverrideKeys ||
    droppedInvalidChord ||
    raw.schemaVersion !== 1

  return {
    next,
    shouldRewrite
  }
}
