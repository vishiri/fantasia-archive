import type { T_faIconPickerCatalogRow } from 'app/types/I_faIconPickerInput'

/**
 * Case-insensitive substring filter over q-icon name strings.
 */
export function filterFaIconPickerCatalogByQuery (
  catalog: readonly string[],
  query: string
): string[] {
  const trimmed = query.trim().toLowerCase()
  if (trimmed.length === 0) {
    return [...catalog]
  }

  return catalog.filter((iconName) => iconName.toLowerCase().includes(trimmed))
}

/**
 * Groups flat icon names into fixed-width rows for QVirtualScroll.
 */
export function chunkFaIconPickerCatalogIntoRows (
  icons: readonly string[],
  iconsPerRow: number
): T_faIconPickerCatalogRow[] {
  if (iconsPerRow < 1) {
    return []
  }

  const rows: T_faIconPickerCatalogRow[] = []

  for (let index = 0; index < icons.length; index += iconsPerRow) {
    rows.push(icons.slice(index, index + iconsPerRow))
  }

  return rows
}
