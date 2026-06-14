import type { SortableEvent } from 'sortablejs'

import type {
  I_dialogProjectSettingsWorldColorPaletteEditorApi,
  I_dialogProjectSettingsWorldColorPaletteEntry,
  T_dialogProjectSettingsWorldColorPaletteEditorUseDeps
} from 'app/types/I_dialogProjectSettingsWorlds'

import { readDialogProjectSettingsWorldColorPaletteEntryHexList } from './functions/dialogProjectSettingsWorldColorPalette'
import {
  createDialogProjectSettingsWorldColorPaletteEditorEmit,
  createDialogProjectSettingsWorldColorPaletteEditorSwatchMutations,
  registerDialogProjectSettingsWorldColorPaletteEditorWatch
} from './dialogProjectSettingsWorldColorPaletteEditorUseHelpers'

export function useDialogProjectSettingsWorldColorPaletteEditorRuntime (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  props: {
    colorPallete: string
  },
  emit: (event: 'update:colorPallete', value: string) => void
): I_dialogProjectSettingsWorldColorPaletteEditorApi {
  const colorPaletteEntries = deps.ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>([])
  const draggingEntryId = deps.ref<string | null>(null)
  const openSwatchIndex = deps.ref<number | null>(null)

  const emitColorPalleteUpdate = (value: string): void => {
    emit('update:colorPallete', value)
  }

  const emitColorPalleteFromEntries = createDialogProjectSettingsWorldColorPaletteEditorEmit(deps, {
    colorPaletteEntries,
    emitColorPallete: emitColorPalleteUpdate
  })

  registerDialogProjectSettingsWorldColorPaletteEditorWatch(deps, {
    colorPaletteEntries,
    readColorPallete: () => props.colorPallete
  })

  const duplicateHexKeys = deps.computed(() => {
    return deps.collectFaProjectWorldColorPalleteDuplicateHexKeys(
      readDialogProjectSettingsWorldColorPaletteEntryHexList(colorPaletteEntries.value)
    )
  })

  const isAddDisabled = deps.computed(() => {
    return deps.wouldFaProjectWorldColorPalleteExceedMaxLength(
      props.colorPallete,
      deps.appendDefaultHex,
      deps.paletteMaxLength
    )
  })

  const isListDragging = deps.computed(() => draggingEntryId.value !== null)

  const worldPickerPalette = deps.computed(() => {
    return deps.parseFaProjectWorldColorPalleteToHexList(props.colorPallete)
  })

  const editorRootClassList = deps.computed(() => ({
    'dialogProjectSettingsWorldColorPalette--listDragging': draggingEntryId.value !== null
  }))

  function onAddColor (): void {
    if (isAddDisabled.value) {
      return
    }
    const nextEntries = deps.appendDialogProjectSettingsWorldColorPaletteEntry(
      colorPaletteEntries.value,
      deps.createEntryId,
      deps.appendDefaultHex
    )
    emitColorPalleteFromEntries(nextEntries)
  }

  function setOpenSwatchIndex (index: number | null): void {
    openSwatchIndex.value = index
  }

  const swatchMutations = createDialogProjectSettingsWorldColorPaletteEditorSwatchMutations(deps, {
    colorPaletteEntries,
    emitColorPalleteFromEntries,
    openSwatchIndex,
    setOpenSwatchIndex
  })

  const onDragStart = (event: SortableEvent): void => {
    draggingEntryId.value = deps.readFaSortableDragItemDataAttribute(
      event.item,
      'data-test-palette-entry-id'
    )
    deps.applyFaVerticalDraggableTabsDocumentDragCursor()
  }

  const onDragEnd = (): void => {
    draggingEntryId.value = null
    deps.clearFaVerticalDraggableTabsDocumentDragCursor()
    emitColorPalleteFromEntries(colorPaletteEntries.value)
  }

  const onSwatchColorUpdate = swatchMutations.onSwatchColorUpdate
  const onSwatchDelete = swatchMutations.onSwatchDelete
  const onSwatchDuplicate = swatchMutations.onSwatchDuplicate
  const wouldSwatchDuplicateExceedMaxLength = swatchMutations.wouldSwatchDuplicateExceedMaxLength

  return {
    VueDraggable: deps.VueDraggable,
    colorPaletteEntries,
    duplicateHexKeys,
    draggingEntryId,
    editorRootClassList,
    faVerticalDraggableTabsSortableDragOptions: deps.faVerticalDraggableTabsSortableDragOptions,
    hideNativeSortableDragGhost: deps.hideNativeSortableDragGhost,
    isAddDisabled,
    isListDragging,
    onAddColor,
    onDragEnd,
    onDragStart,
    onSwatchColorUpdate,
    onSwatchDelete,
    onSwatchDuplicate,
    openSwatchIndex,
    worldPickerPalette,
    setOpenSwatchIndex,
    wouldSwatchDuplicateExceedMaxLength
  }
}
