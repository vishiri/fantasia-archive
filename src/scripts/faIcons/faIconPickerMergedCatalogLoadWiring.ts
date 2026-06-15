import { FA_ICON_PICKER_PACK_IDS } from 'app/types/I_faIconPickerInput'

import { loadFaIconPickerCatalogAsync } from './faIconPickerCatalogLazyLoadWiring'
import { loadFaIconPickerMergedCatalogSlicesAsync } from './functions/faIconPickerMergedCatalog'

export async function loadFaIconPickerMergedCatalogAsync (): Promise<string[]> {
  return loadFaIconPickerMergedCatalogSlicesAsync({
    loadFaIconPickerCatalogAsync,
    packIds: FA_ICON_PICKER_PACK_IDS
  })
}
