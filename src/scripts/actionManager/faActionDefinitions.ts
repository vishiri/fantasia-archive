import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

import { FA_ACTION_DEFINITIONS_HEAD } from 'app/src/scripts/actionManager/faActionDefinitionsHead'
import { FA_ACTION_DEFINITIONS_TAIL } from 'app/src/scripts/actionManager/faActionDefinitionsTail'

/**
 * Single source of truth for every renderer-side user-meaningful action.
 * To add a new action: extend 'FA_ACTION_IDS' / 'I_faActionPayloadMap' in 'types/I_faActionManagerDomain.ts',
 * then append the matching definition here so the compiler enforces both ends.
 */
export const FA_ACTION_DEFINITIONS: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
  ...FA_ACTION_DEFINITIONS_HEAD,
  ...FA_ACTION_DEFINITIONS_TAIL
]

const FA_ACTION_DEFINITION_LOOKUP: Map<T_faActionId, I_faActionDefinition<T_faActionId>> = new Map(
  FA_ACTION_DEFINITIONS.map((definition) => [definition.id, definition])
)

/**
 * Lookup helper used by 'faActionManagerRun' / 'faActionManagerSyncQueue'.
 * Returns 'undefined' for ids that are not registered (the manager treats this as a hard failure).
 */
export function findFaActionDefinition (id: T_faActionId): I_faActionDefinition<T_faActionId> | undefined {
  return FA_ACTION_DEFINITION_LOOKUP.get(id)
}
