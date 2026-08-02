import type { I_faComponentTestingProjectContentOverrides } from 'app/types/I_faComponentTestingStoreSeed'

/**
 * Looks up a seeded component-testing entity by id.
 */
export function resolveFaComponentTestingProjectContentEntity<T> (
  entitiesById: Record<string, T> | undefined,
  entityId: string
): T | undefined {
  if (entitiesById === undefined) {
    return undefined
  }
  return entitiesById[entityId]
}

/**
 * True when component-testing overrides include at least one entity map.
 */
export function hasFaComponentTestingProjectContentOverrides (
  overrides: I_faComponentTestingProjectContentOverrides | null
): boolean {
  if (overrides === null) {
    return false
  }
  return overrides.documentsById !== undefined ||
    overrides.templatesById !== undefined ||
    overrides.worldsById !== undefined
}
