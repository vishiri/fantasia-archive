import type {
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'

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
  for (const id of commandIds) {
    if (!Object.prototype.hasOwnProperty.call(fromDiskRaw, id)) {
      continue
    }
    const v = fromDiskRaw[id]
    if (v === null) {
      overrides[id] = null
    } else if (v !== undefined && typeof v === 'object' && !Array.isArray(v)) {
      overrides[id] = v as I_faKeybindsRoot['overrides'][typeof id]
    }
  }

  const next: I_faKeybindsRoot = {
    overrides,
    schemaVersion: 1
  }

  const unexpectedTop = Object.keys(raw).some((k) => k !== 'schemaVersion' && k !== 'overrides')
  const unexpectedOverrideKeys = Object.keys(fromDiskRaw).some((k) => {
    return !isFaKeybindCommandId(k)
  })

  const shouldRewrite = unexpectedTop || unexpectedOverrideKeys || raw.schemaVersion !== 1

  return {
    next,
    shouldRewrite
  }
}
