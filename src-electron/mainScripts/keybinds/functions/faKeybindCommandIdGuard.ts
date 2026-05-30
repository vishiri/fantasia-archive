import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

export function createIsFaKeybindCommandId (
  commandIds: readonly T_faKeybindCommandId[]
): (key: string) => key is T_faKeybindCommandId {
  const known = commandIds as readonly string[]

  const isFaKeybindCommandId = (key: string): key is T_faKeybindCommandId => {
    return known.includes(key)
  }

  return isFaKeybindCommandId
}
