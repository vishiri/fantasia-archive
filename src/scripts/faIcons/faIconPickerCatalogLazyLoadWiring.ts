import type { T_faIconPickerPackId } from 'app/types/I_faIconPickerInput'

export async function loadFaIconPickerCatalogAsync (
  packId: T_faIconPickerPackId
): Promise<string[]> {
  switch (packId) {
    case 'mdi-v7': {
      const module = await import('app/src/scripts/faIcons/catalogs/mdi-v7.catalog.json')
      return [...module.default]
    }
    case 'fontawesome-v6': {
      const module = await import('app/src/scripts/faIcons/catalogs/fontawesome-v6.catalog.json')
      return [...module.default]
    }
    case 'material-icons': {
      const module = await import('app/src/scripts/faIcons/catalogs/material-icons.catalog.json')
      return [...module.default]
    }
    default: {
      const exhaustive: never = packId
      return exhaustive
    }
  }
}
