import { computed, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

import {
  FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
  FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH
} from 'app/types/I_faProjectWorldDomain'
import {
  collectFaProjectWorldColorPalleteDuplicateHexKeys,
  parseFaProjectWorldColorPalleteToHexList,
  parseFaProjectWorldColorPalleteToHexListPreservingDuplicates,
  serializeFaProjectWorldColorPalleteFromHexList,
  wouldFaProjectWorldColorPalleteExceedMaxLength
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPalleteHexList'
import { hideNativeSortableDragGhost } from 'app/src/scripts/faDragDrop/functions/hideNativeSortableDragGhost'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsDocumentDragCursor'
import { faVerticalDraggableTabsSortableDragOptions } from 'app/src/scripts/faDragDrop/functions/faVerticalDraggableTabsSortableDragOptions'
import { readFaSortableDragItemDataAttribute } from 'app/src/scripts/faDragDrop/functions/readFaSortableDragItemDataAttribute'

import {
  appendDialogProjectSettingsWorldColorPaletteEntry,
  buildDialogProjectSettingsWorldColorPaletteEntries,
  duplicateDialogProjectSettingsWorldColorPaletteEntryAfter,
  removeDialogProjectSettingsWorldColorPaletteEntry,
  replaceDialogProjectSettingsWorldColorPaletteEntryHex,
  wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength
} from './functions/dialogProjectSettingsWorldColorPalette'
import { createUseDialogProjectSettingsWorldColorPaletteEditor } from './dialogProjectSettingsWorldColorPaletteEditorUseWiring'

export const useDialogProjectSettingsWorldColorPaletteEditor = createUseDialogProjectSettingsWorldColorPaletteEditor({
  VueDraggable,
  appendDefaultHex: FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
  appendDialogProjectSettingsWorldColorPaletteEntry,
  applyFaVerticalDraggableTabsDocumentDragCursor,
  buildDialogProjectSettingsWorldColorPaletteEntries,
  clearFaVerticalDraggableTabsDocumentDragCursor,
  collectFaProjectWorldColorPalleteDuplicateHexKeys,
  computed,
  createEntryId: () => crypto.randomUUID(),
  duplicateDialogProjectSettingsWorldColorPaletteEntryAfter,
  faVerticalDraggableTabsSortableDragOptions,
  hideNativeSortableDragGhost,
  paletteMaxLength: FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
  parseFaProjectWorldColorPalleteToHexList,
  parseFaProjectWorldColorPalleteToHexListPreservingDuplicates,
  readFaSortableDragItemDataAttribute,
  ref,
  removeDialogProjectSettingsWorldColorPaletteEntry,
  replaceDialogProjectSettingsWorldColorPaletteEntryHex,
  serializeFaProjectWorldColorPalleteFromHexList,
  watch,
  wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength,
  wouldFaProjectWorldColorPalleteExceedMaxLength
})
