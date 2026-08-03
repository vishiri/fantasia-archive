import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import {
  FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
  FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH
} from 'app/types/I_faProjectWorldDomain'
import {
  collectFaProjectWorldColorPaletteDuplicateHexKeys,
  parseFaProjectWorldColorPaletteToHexList,
  parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
  serializeFaProjectWorldColorPaletteFromHexList,
  wouldFaProjectWorldColorPaletteExceedMaxLength
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPaletteHexList'
import {
  appendDialogProjectSettingsWorldColorPaletteEntry,
  buildDialogProjectSettingsWorldColorPaletteEntries,
  duplicateDialogProjectSettingsWorldColorPaletteEntryAfter,
  removeDialogProjectSettingsWorldColorPaletteEntry,
  replaceDialogProjectSettingsWorldColorPaletteEntryHex,
  wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength
} from '../functions/dialogProjectSettingsWorldColorPalette'
import { createUseDialogProjectSettingsWorldColorPaletteEditor } from '../dialogProjectSettingsWorldColorPaletteEditorUseWiring'

let entryCounter = 0

const useEditor = createUseDialogProjectSettingsWorldColorPaletteEditor({
  VueDraggable: 'div',
  appendDefaultHex: FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
  appendDialogProjectSettingsWorldColorPaletteEntry,
  applyFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
  buildDialogProjectSettingsWorldColorPaletteEntries,
  clearFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
  collectFaProjectWorldColorPaletteDuplicateHexKeys,
  computed,
  createEntryId: () => `entry-${String(++entryCounter)}`,
  duplicateDialogProjectSettingsWorldColorPaletteEntryAfter,
  faVerticalDraggableTabsSortableDragOptions: {},
  hideNativeSortableDragGhost: vi.fn(),
  paletteMaxLength: FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
  parseFaProjectWorldColorPaletteToHexList,
  parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
  readFaSortableDragItemDataAttribute: vi.fn(() => 'entry-1'),
  ref,
  removeDialogProjectSettingsWorldColorPaletteEntry,
  replaceDialogProjectSettingsWorldColorPaletteEntryHex,
  serializeFaProjectWorldColorPaletteFromHexList,
  watch: (source, effect, options) => {
    if (options?.immediate) {
      effect(source())
    }
    return () => undefined
  },
  wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength,
  wouldFaProjectWorldColorPaletteExceedMaxLength
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Emits palette updates when colors are appended, edited, or reordered.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor emits palette updates', () => {
  entryCounter = 0
  const emitted: string[] = []
  const props = {
    colorPalette: '#112233'
  }
  const api = useEditor(props, (event, value) => {
    if (event === 'update:colorPalette') {
      emitted.push(value)
      props.colorPalette = value
    }
  })

  api.onAddColor()
  expect(emitted[0]!).toBe('#112233;#FFFFFF')

  const firstEntryId = api.colorPaletteEntries.value[0]!?.id ?? ''
  api.onSwatchColorUpdate(firstEntryId, '#AABBCC')
  expect(emitted[1]!).toContain('#AABBCC')

  api.onDragStart({
    item: document.createElement('div')
  } as never)
  api.onDragEnd()
  expect(emitted.length).toBeGreaterThan(1)

  api.setOpenSwatchIndex(0)
  expect(api.openSwatchIndex.value).toBe(0)
  api.setOpenSwatchIndex(null)
  expect(api.openSwatchIndex.value).toBeNull()

  api.onSwatchDuplicate(firstEntryId)
  expect(emitted[emitted.length - 1]).toBe('#AABBCC;#AABBCC;#FFFFFF')

  const whiteEntryId = api.colorPaletteEntries.value.find((entry) => entry.hex === '#FFFFFF')?.id ?? ''
  api.onSwatchDelete(whiteEntryId)

  api.setOpenSwatchIndex(1)
  api.onSwatchDelete(firstEntryId)
  expect(api.openSwatchIndex.value).toBeNull()
  expect(emitted[emitted.length - 1]).toBe('#AABBCC')
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Derives QColor footer swatches from the current world palette string only.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor derives worldPickerPalette from colorPalette', () => {
  entryCounter = 0
  const props = {
    colorPalette: '#112233;#445566'
  }
  const api = useEditor(props, () => undefined)

  expect(api.worldPickerPalette.value).toEqual(['#112233', '#445566'])
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Exposes duplicate hex keys and drag-state computeds for the palette editor.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor exposes drag and duplicate state', () => {
  entryCounter = 0
  const props = {
    colorPalette: '#112233;#112233'
  }
  const api = useEditor(props, () => undefined)

  expect(api.duplicateHexKeys.value.has('#112233')).toBe(true)
  expect(api.isListDragging.value).toBe(false)
  expect(api.editorRootClassList.value['dialogProjectSettingsWorldColorPalette--listDragging']).toBe(false)

  api.onDragStart({
    item: document.createElement('div')
  } as never)
  expect(api.isListDragging.value).toBe(true)
  api.onDragEnd()
  expect(api.isListDragging.value).toBe(false)
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Skips append when the palette length cap would be exceeded.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor skips append when disabled', () => {
  entryCounter = 0
  const cappedUseEditor = createUseDialogProjectSettingsWorldColorPaletteEditor({
    VueDraggable: 'div',
    appendDefaultHex: FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
    appendDialogProjectSettingsWorldColorPaletteEntry,
    applyFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    buildDialogProjectSettingsWorldColorPaletteEntries,
    clearFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    collectFaProjectWorldColorPaletteDuplicateHexKeys,
    computed,
    createEntryId: () => `entry-${String(++entryCounter)}`,
    duplicateDialogProjectSettingsWorldColorPaletteEntryAfter,
    faVerticalDraggableTabsSortableDragOptions: {},
    hideNativeSortableDragGhost: vi.fn(),
    paletteMaxLength: 7,
    parseFaProjectWorldColorPaletteToHexList,
    parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
    readFaSortableDragItemDataAttribute: vi.fn(() => 'entry-1'),
    ref,
    removeDialogProjectSettingsWorldColorPaletteEntry,
    replaceDialogProjectSettingsWorldColorPaletteEntryHex,
    serializeFaProjectWorldColorPaletteFromHexList,
    watch: (source, effect, options) => {
      if (options?.immediate) {
        effect(source())
      }
      return () => undefined
    },
    wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength,
    wouldFaProjectWorldColorPaletteExceedMaxLength
  })
  const props = {
    colorPalette: '#112233'
  }
  const api = cappedUseEditor(props, () => undefined)
  expect(api.isAddDisabled.value).toBe(true)
  api.onAddColor()
  expect(api.colorPaletteEntries.value).toHaveLength(1)
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Exposes duplicate hex keys when the palette repeats a color.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor tracks duplicate hex keys', () => {
  entryCounter = 0
  const props = {
    colorPalette: '#112233;#112233'
  }
  const api = useEditor(props, () => undefined)
  expect(api.duplicateHexKeys.value.has('#112233')).toBe(true)
  expect(api.duplicateHexKeys.value.size).toBe(1)

  entryCounter = 0
  const uniqueProps = {
    colorPalette: '#112233'
  }
  const uniqueApi = useEditor(uniqueProps, () => undefined)
  expect(uniqueApi.duplicateHexKeys.value.size).toBe(0)
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Skips duplicate and delete when guards block the mutation.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor skips blocked swatch mutations', () => {
  entryCounter = 0
  const duplicateAfter = vi.fn(() => null)
  const removeEntry = vi.fn(() => null)
  const wouldDuplicateExceed = vi.fn(() => true)
  const guardedUseEditor = createUseDialogProjectSettingsWorldColorPaletteEditor({
    VueDraggable: 'div',
    appendDefaultHex: FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
    appendDialogProjectSettingsWorldColorPaletteEntry,
    applyFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    buildDialogProjectSettingsWorldColorPaletteEntries,
    clearFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    collectFaProjectWorldColorPaletteDuplicateHexKeys,
    computed,
    createEntryId: () => `entry-${String(++entryCounter)}`,
    duplicateDialogProjectSettingsWorldColorPaletteEntryAfter: duplicateAfter,
    faVerticalDraggableTabsSortableDragOptions: {},
    hideNativeSortableDragGhost: vi.fn(),
    paletteMaxLength: FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    parseFaProjectWorldColorPaletteToHexList,
    parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
    readFaSortableDragItemDataAttribute: vi.fn(() => 'entry-1'),
    ref,
    removeDialogProjectSettingsWorldColorPaletteEntry: removeEntry,
    replaceDialogProjectSettingsWorldColorPaletteEntryHex,
    serializeFaProjectWorldColorPaletteFromHexList,
    watch: (source, effect, options) => {
      if (options?.immediate) {
        effect(source())
      }
      return () => undefined
    },
    wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength: wouldDuplicateExceed,
    wouldFaProjectWorldColorPaletteExceedMaxLength
  })
  const emitted: string[] = []
  const props = {
    colorPalette: '#112233'
  }
  const api = guardedUseEditor(props, (event, value) => {
    if (event === 'update:colorPalette') {
      emitted.push(value)
    }
  })
  const firstEntryId = api.colorPaletteEntries.value[0]!?.id ?? ''

  api.onSwatchDuplicate(firstEntryId)
  expect(wouldDuplicateExceed).toHaveBeenCalled()
  expect(duplicateAfter).not.toHaveBeenCalled()

  api.setOpenSwatchIndex(0)
  api.onSwatchDelete(firstEntryId)
  expect(removeEntry).toHaveBeenCalled()
  expect(emitted).toHaveLength(0)
  expect(api.openSwatchIndex.value).toBe(0)
})

/**
 * createUseDialogProjectSettingsWorldColorPaletteEditor
 * Skips duplicate when the duplicate helper returns null.
 */
test('Test that createUseDialogProjectSettingsWorldColorPaletteEditor skips duplicate when insert fails', () => {
  entryCounter = 0
  const duplicateAfter = vi.fn(() => null)
  const guardedUseEditor = createUseDialogProjectSettingsWorldColorPaletteEditor({
    VueDraggable: 'div',
    appendDefaultHex: FA_PROJECT_WORLD_COLOR_PALETTE_APPEND_DEFAULT_HEX,
    appendDialogProjectSettingsWorldColorPaletteEntry,
    applyFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    buildDialogProjectSettingsWorldColorPaletteEntries,
    clearFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    collectFaProjectWorldColorPaletteDuplicateHexKeys,
    computed,
    createEntryId: () => `entry-${String(++entryCounter)}`,
    duplicateDialogProjectSettingsWorldColorPaletteEntryAfter: duplicateAfter,
    faVerticalDraggableTabsSortableDragOptions: {},
    hideNativeSortableDragGhost: vi.fn(),
    paletteMaxLength: FA_PROJECT_WORLD_COLOR_PALETTE_MAX_LENGTH,
    parseFaProjectWorldColorPaletteToHexList,
    parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
    readFaSortableDragItemDataAttribute: vi.fn(() => 'entry-1'),
    ref,
    removeDialogProjectSettingsWorldColorPaletteEntry,
    replaceDialogProjectSettingsWorldColorPaletteEntryHex,
    serializeFaProjectWorldColorPaletteFromHexList,
    watch: (source, effect, options) => {
      if (options?.immediate) {
        effect(source())
      }
      return () => undefined
    },
    wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength,
    wouldFaProjectWorldColorPaletteExceedMaxLength
  })
  const emitted: string[] = []
  const props = {
    colorPalette: '#112233'
  }
  const api = guardedUseEditor(props, (event, value) => {
    if (event === 'update:colorPalette') {
      emitted.push(value)
    }
  })
  const firstEntryId = api.colorPaletteEntries.value[0]!?.id ?? ''
  api.onSwatchDuplicate(firstEntryId)
  expect(duplicateAfter).toHaveBeenCalled()
  expect(emitted).toHaveLength(0)
})
