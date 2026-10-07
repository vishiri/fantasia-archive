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
  readDialogProjectSettingsWorldColorPaletteSerializedEntries,
  registerDialogProjectSettingsWorldColorPaletteEditorWatch
} from './dialogProjectSettingsWorldColorPaletteEditorUseHelpers'

function createDialogProjectSettingsWorldColorPaletteEditorRootClassList (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  draggingEntryId: { value: string | null }
) {
  return deps.computed(() => {
    const listDragging = draggingEntryId.value !== null
    return {
      'dialogProjectSettingsWorldColorPalette--listDragging': listDragging
    }
  })
}

function createDialogProjectSettingsWorldColorPaletteEditorDragHandlers (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  draggingEntryId: { value: string | null },
  colorPaletteEntries: { value: I_dialogProjectSettingsWorldColorPaletteEntry[] },
  emitColorPaletteFromEntries: (entries: I_dialogProjectSettingsWorldColorPaletteEntry[]) => void
) {
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
  return {
    onDragEnd,
    onDragStart
  }
}

export function useDialogProjectSettingsWorldColorPaletteEditorRuntime (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  props: {
    colorPalette: string
  },
  emit: (event: 'update:colorPalette', value: string) => void
): I_dialogProjectSettingsWorldColorPaletteEditorApi {
  const colorPaletteEntries = deps.ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>([])
  const draggingEntryId = deps.ref<string | null>(null)
  const openSwatchEntryId = deps.ref<string | null>(null)

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
      readDialogProjectSettingsWorldColorPaletteSerializedEntries(deps, colorPaletteEntries.value),
      deps.appendDefaultHex,
      deps.paletteMaxLength
    )
  })

  const isListDragging = deps.computed(() => draggingEntryId.value !== null)

  const worldPickerPalette = deps.computed(() => {
    return deps.parseFaProjectWorldColorPaletteToHexList(props.colorPalette)
  })

  const editorRootClassList = createDialogProjectSettingsWorldColorPaletteEditorRootClassList(deps, draggingEntryId)

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

  function setOpenSwatchEntryId (entryId: string | null): void {
    openSwatchEntryId.value = entryId
  }

  const swatchMutations = createDialogProjectSettingsWorldColorPaletteEditorSwatchMutations(deps, {
    colorPaletteEntries,
    emitColorPaletteFromEntries,
    openSwatchEntryId,
    setOpenSwatchEntryId
  })

  const {
    onDragEnd,
    onDragStart
  } = createDialogProjectSettingsWorldColorPaletteEditorDragHandlers(
    deps,
    draggingEntryId,
    colorPaletteEntries,
    emitColorPaletteFromEntries
  )

  const onSwatchColorUpdate = swatchMutations.onSwatchColorUpdate
  const onSwatchDelete = swatchMutations.onSwatchDelete
  const onSwatchDuplicate = swatchMutations.onSwatchDuplicate
  const wouldSwatchDuplicateExceedMaxLength = swatchMutations.wouldSwatchDuplicateExceedMaxLength
  const {
    VueDraggable,
    faVerticalDraggableTabsSortableDragOptions,
    hideNativeSortableDragGhost
  } = deps

  return {
    VueDraggable,
    colorPaletteEntries,
    duplicateHexKeys,
    draggingEntryId,
    editorRootClassList,
    faVerticalDraggableTabsSortableDragOptions,
    hideNativeSortableDragGhost,
    isAddDisabled,
    isListDragging,
    onAddColor,
    onDragEnd,
    onDragStart,
    onSwatchColorUpdate,
    onSwatchDelete,
    onSwatchDuplicate,
    openSwatchEntryId,
    worldPickerPalette,
    setOpenSwatchEntryId,
    wouldSwatchDuplicateExceedMaxLength
  }
}
