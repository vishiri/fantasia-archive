import type { I_foundationQuasarMaterialGroup } from 'app/types/I_foundationCatalogues'

/**
 * Root color names from the Quasar material palette (each has base plus -1 … -14).
 * @see https://quasar.dev/style/color-palette#color-list
 */
const QUASAR_MATERIAL_COLOR_ROOTS = [
  'red',
  'pink',
  'purple',
  'deep-purple',
  'indigo',
  'blue',
  'light-blue',
  'cyan',
  'teal',
  'green',
  'light-green',
  'lime',
  'yellow',
  'amber',
  'orange',
  'deep-orange',
  'brown',
  'grey',
  'blue-grey'
] as const

/**
 * Suffixes for Quasar bg-* / text-* classes (empty string = base swatch, e.g. red).
 */
const SHADE_SUFFIXES = ['', '-1', '-2', '-3', '-4', '-5', '-6', '-7', '-8', '-9', '-10', '-11', '-12', '-13', '-14'] as const

/**
 * Returns Quasar palette class stems (for example 'red', 'red-3', 'deep-purple-12').
 */
export function buildQuasarMaterialClassStems (): string[] {
  const out: string[] = []

  for (const root of QUASAR_MATERIAL_COLOR_ROOTS) {
    for (const shade of SHADE_SUFFIXES) {
      out.push(`${root}${shade}`)
    }
  }

  return out
}

/**
 * Groups flat Quasar material stems by root color (red … blue-grey), fifteen shades each.
 */
export function buildQuasarMaterialGroups (): I_foundationQuasarMaterialGroup[] {
  const flat = buildQuasarMaterialClassStems()
  const groups: I_foundationQuasarMaterialGroup[] = []
  let offset = 0

  for (const root of QUASAR_MATERIAL_COLOR_ROOTS) {
    groups.push({
      root,
      stems: flat.slice(offset, offset + SHADE_SUFFIXES.length)
    })
    offset += SHADE_SUFFIXES.length
  }

  return groups
}
