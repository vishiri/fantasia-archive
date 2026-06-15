/**
 * Converts a camelCase segment to kebab-case for q-icon webfont names.
 */
export function faIconPickerCamelCaseToKebab (segment: string): string {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Maps an @quasar/extras mdi-v7 icons.json export key to a q-icon name.
 */
export function faIconPickerMdiExportKeyToQIconName (exportKey: string): string {
  if (!exportKey.startsWith('mdi')) {
    return exportKey
  }

  const withoutPrefix = exportKey.slice(3)
  if (withoutPrefix.length === 0) {
    return 'mdi'
  }

  return `mdi-${faIconPickerCamelCaseToKebab(withoutPrefix)}`
}

/**
 * Maps an @quasar/extras fontawesome-v6 icons.json export key to a q-icon name.
 */
export function faIconPickerFa6ExportKeyToQIconName (exportKey: string): string {
  if (exportKey.startsWith('fab')) {
    const rest = exportKey.slice(3)
    return `fa-brands fa-${faIconPickerCamelCaseToKebab(rest)}`
  }

  if (exportKey.startsWith('fas')) {
    const rest = exportKey.slice(3)
    return `fa-solid fa-${faIconPickerCamelCaseToKebab(rest)}`
  }

  if (exportKey.startsWith('far')) {
    const rest = exportKey.slice(3)
    return `fa-regular fa-${faIconPickerCamelCaseToKebab(rest)}`
  }

  return exportKey
}

/**
 * Builds sorted q-icon name arrays from extras export-key lists.
 */
export function faIconPickerBuildMdiCatalogFromExportKeys (exportKeys: readonly string[]): string[] {
  const names = exportKeys.map(faIconPickerMdiExportKeyToQIconName)
  return [...names].sort((left, right) => left.localeCompare(right))
}

export function faIconPickerBuildFa6CatalogFromExportKeys (exportKeys: readonly string[]): string[] {
  const names = exportKeys.map(faIconPickerFa6ExportKeyToQIconName)
  return [...names].sort((left, right) => left.localeCompare(right))
}

export function faIconPickerBuildMaterialCatalogFromLigatures (
  ligatureNames: readonly string[]
): string[] {
  const names = ligatureNames
    .map((name) => name.trim())
    .filter((name) => name.length > 0)

  return [...names].sort((left, right) => left.localeCompare(right))
}
