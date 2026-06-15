import type { T_faIconPickerPackId } from 'app/types/I_faIconPickerInput'

/**
 * Merges icon name slices into one sorted list with stable deduplication.
 */
export function mergeFaIconPickerCatalogSlices (
  slices: readonly (readonly string[])[]
): string[] {
  const seen = new Set<string>()
  const merged: string[] = []

  for (const slice of slices) {
    for (const iconName of slice) {
      if (seen.has(iconName)) {
        continue
      }

      seen.add(iconName)
      merged.push(iconName)
    }
  }

  return merged.sort((left, right) => left.localeCompare(right))
}

export async function loadFaIconPickerMergedCatalogSlicesAsync (deps: {
  loadFaIconPickerCatalogAsync: (packId: T_faIconPickerPackId) => Promise<string[]>
  packIds: readonly T_faIconPickerPackId[]
}): Promise<string[]> {
  const slices = await Promise.all(
    deps.packIds.map((packId) => deps.loadFaIconPickerCatalogAsync(packId))
  )

  return mergeFaIconPickerCatalogSlices(slices)
}
