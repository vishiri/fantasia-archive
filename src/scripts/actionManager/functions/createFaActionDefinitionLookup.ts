import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

export function createFaActionDefinitionLookup (deps: {
  definitions: ReadonlyArray<I_faActionDefinition<T_faActionId>>
}): {
    findFaActionDefinition: (
      id: T_faActionId
    ) => I_faActionDefinition<T_faActionId> | undefined
  } {
  const faActionDefinitionLookup: Map<T_faActionId, I_faActionDefinition<T_faActionId>> =
    new Map(deps.definitions.map((definition) => [definition.id, definition]))

  const findFaActionDefinition = (
    id: T_faActionId
  ): I_faActionDefinition<T_faActionId> | undefined => {
    return faActionDefinitionLookup.get(id)
  }

  return {
    findFaActionDefinition
  }
}
