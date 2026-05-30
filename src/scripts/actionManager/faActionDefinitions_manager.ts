import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

import { FA_ACTION_DEFINITIONS_HEAD } from './faActionDefinitionsHead_manager'
import { FA_ACTION_DEFINITIONS_TAIL } from './faActionDefinitionsTail_manager'
import { createFaActionDefinitionLookup } from './functions/createFaActionDefinitionLookup'

export const FA_ACTION_DEFINITIONS: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
  ...FA_ACTION_DEFINITIONS_HEAD,
  ...FA_ACTION_DEFINITIONS_TAIL
]

const faActionDefinitionLookup = createFaActionDefinitionLookup({
  definitions: FA_ACTION_DEFINITIONS
})

export const findFaActionDefinition = faActionDefinitionLookup.findFaActionDefinition
