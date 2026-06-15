import { computed, ref } from 'vue'

import {
  FA_ICON_PICKER_ICONS_PER_ROW,
  FA_ICON_PICKER_SEARCH_DEBOUNCE_MS
} from 'app/types/I_faIconPickerInput'

import {
  chunkFaIconPickerCatalogIntoRows,
  filterFaIconPickerCatalogByQuery
} from 'app/src/scripts/faIcons/functions/faIconPickerCatalogFilter'
import { loadFaIconPickerMergedCatalogForMenu } from 'app/src/scripts/faIcons/functions/faIconPickerInputMergedCatalogLoader'
import { createFaIconPickerSearchDebounce } from 'app/src/scripts/faIcons/functions/faIconPickerInputSearchDebounce'
import { loadFaIconPickerMergedCatalogAsync } from 'app/src/scripts/faIcons/faIconPickerMergedCatalogLoadWiring'
import { createUseFaIconPickerInput } from './faIconPickerInputComposableWiring'

export const useFaIconPickerInput = createUseFaIconPickerInput({
  chunkFaIconPickerCatalogIntoRows,
  computed,
  createFaIconPickerSearchDebounce,
  filterFaIconPickerCatalogByQuery,
  iconsPerRow: FA_ICON_PICKER_ICONS_PER_ROW,
  loadFaIconPickerMergedCatalogAsync,
  loadFaIconPickerMergedCatalogForMenu,
  ref,
  searchDebounceMs: FA_ICON_PICKER_SEARCH_DEBOUNCE_MS
})
