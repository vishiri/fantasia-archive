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
    colorPalette: string
  },
  emit: (event: 'update:colorPalette', value: string) => void
): I_dialogProjectSettingsWorldColorPaletteEditorApi {
  const colorPaletteEntries = deps.ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>([])
  const draggingEntryId = deps.ref<string | null>(null)
  const openSwatchIndex = deps.ref<number | null>(null)

  const emitColorPaletteUpdate = (value: string): void => {
    emit('update:colorPalette', value)
  }

  const emitColorPaletteFromEntries = createDialogProjectSettingsWorldColorPaletteEditorEmit(deps, {
    colorPaletteEntries,
    emitColorPalette: emitColorPaletteUpdate
  })

  registerDialogProjectSettingsWorldColorPaletteEditorWatch(deps, {
    colorPaletteEntries,
    readColorPalette: () => props.colorPalette
  })

  const duplicateHexKeys = deps.computed(() => {
    return deps.collectFaProjectWorldColorPaletteDuplicateHexKeys(
      readDialogProjectSettingsWorldColorPaletteEntryHexList(colorPaletteEntries.value)
    )
  })

  const isAddDisabled = deps.computed(() => {
    return deps.wouldFaProjectWorldColorPaletteExceedMaxLength(
      props.colorPalette,
      deps.appendDefaultHex,
      deps.paletteMaxLength
    )
  })

  const isListDragging = deps.computed(() => draggingEntryId.value !== null)

  const worldPickerPalette = deps.computed(() => {
    return deps.parseFaProjectWorldColorPaletteToHexList(props.colorPalette)
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
    emitColorPaletteFromEntries(nextEntries)
  }

  function setOpenSwatchIndex (index: number | null): void {
    openSwatchIndex.value = index
  }

  const swatchMutations = createDialogProjectSettingsWorldColorPaletteEditorSwatchMutations(deps, {
    colorPaletteEntries,
    emitColorPaletteFromEntries,
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
    emitColorPaletteFromEntries(colorPaletteEntries.value)
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
