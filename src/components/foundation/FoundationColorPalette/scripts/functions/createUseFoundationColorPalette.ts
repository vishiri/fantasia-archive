import type {
  I_foundationCustomSwatch,
  I_foundationQuasarMaterialGroup
} from 'app/types/I_foundationCatalogues'

export function createUseFoundationColorPalette (deps: {
  buildQuasarMaterialGroups: () => I_foundationQuasarMaterialGroup[]
  customSwatches: I_foundationCustomSwatch[]
}): () => {
    customSwatches: I_foundationCustomSwatch[]
    materialGroups: I_foundationQuasarMaterialGroup[]
  } {
  return function useFoundationColorPalette () {
    const customSwatches = deps.customSwatches
    const materialGroups = deps.buildQuasarMaterialGroups()

    return {
      customSwatches,
      materialGroups
    }
  }
}
