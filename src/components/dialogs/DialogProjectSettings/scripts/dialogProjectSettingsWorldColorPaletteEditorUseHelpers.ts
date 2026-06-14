import type { I_ref } from 'app/types/I_vueCompositionShims'

import type {
  I_dialogProjectSettingsWorldColorPaletteEntry,
  T_dialogProjectSettingsWorldColorPaletteEditorUseDeps
} from 'app/types/I_dialogProjectSettingsWorlds'

import {
  readDialogProjectSettingsWorldColorPaletteEntryHexList,
  shouldResyncDialogProjectSettingsWorldColorPaletteFromProp
} from './functions/dialogProjectSettingsWorldColorPalette'

export function registerDialogProjectSettingsWorldColorPaletteEditorWatch (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  params: {
    colorPaletteEntries: I_ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>
    readColorPallete: () => string
  }
): void {
  deps.watch(() => params.readColorPallete(), (nextColorPallete) => {
    if (!shouldResyncDialogProjectSettingsWorldColorPaletteFromProp(
      params.colorPaletteEntries.value,
      nextColorPallete,
      deps.serializeFaProjectWorldColorPalleteFromHexList
    )) {
      return
    }
    const hexList = deps.parseFaProjectWorldColorPalleteToHexListPreservingDuplicates(nextColorPallete)
    params.colorPaletteEntries.value = deps.buildDialogProjectSettingsWorldColorPaletteEntries(
      hexList,
      deps.createEntryId
    )
  }, {
    immediate: true
  })
}

export function createDialogProjectSettingsWorldColorPaletteEditorEmit (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  params: {
    colorPaletteEntries: I_ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>
    emitColorPallete: (value: string) => void
  }
): (entries: I_dialogProjectSettingsWorldColorPaletteEntry[]) => void {
  return function emitColorPalleteFromEntries (
    entries: I_dialogProjectSettingsWorldColorPaletteEntry[]
  ): void {
    const hexList = readDialogProjectSettingsWorldColorPaletteEntryHexList(entries)
    params.emitColorPallete(deps.serializeFaProjectWorldColorPalleteFromHexList(hexList))
    params.colorPaletteEntries.value = entries
  }
}

export function createDialogProjectSettingsWorldColorPaletteEditorSwatchMutations (
  deps: T_dialogProjectSettingsWorldColorPaletteEditorUseDeps,
  params: {
    colorPaletteEntries: I_ref<I_dialogProjectSettingsWorldColorPaletteEntry[]>
    emitColorPalleteFromEntries: (
      entries: I_dialogProjectSettingsWorldColorPaletteEntry[]
    ) => void
    openSwatchIndex: I_ref<number | null>
    setOpenSwatchIndex: (index: number | null) => void
  }
): {
    onSwatchColorUpdate: (entryId: string, hex: string) => void
    onSwatchDelete: (entryId: string) => void
    onSwatchDuplicate: (entryId: string) => void
    wouldSwatchDuplicateExceedMaxLength: (entryId: string) => boolean
  } {
  function wouldSwatchDuplicateExceedMaxLength (entryId: string): boolean {
    return deps.wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength(
      params.colorPaletteEntries.value,
      entryId,
      deps.serializeFaProjectWorldColorPalleteFromHexList,
      deps.wouldFaProjectWorldColorPalleteExceedMaxLength,
      deps.paletteMaxLength
    )
  }

  function onSwatchColorUpdate (entryId: string, hex: string): void {
    const nextEntries = deps.replaceDialogProjectSettingsWorldColorPaletteEntryHex(
      params.colorPaletteEntries.value,
      entryId,
      hex
    )
    params.emitColorPalleteFromEntries(nextEntries)
  }

  function onSwatchDuplicate (entryId: string): void {
    if (wouldSwatchDuplicateExceedMaxLength(entryId)) {
      return
    }
    const nextEntries = deps.duplicateDialogProjectSettingsWorldColorPaletteEntryAfter(
      params.colorPaletteEntries.value,
      entryId,
      deps.createEntryId
    )
    if (nextEntries === null) {
      return
    }
    params.emitColorPalleteFromEntries(nextEntries)
  }

  function onSwatchDelete (entryId: string): void {
    const nextEntries = deps.removeDialogProjectSettingsWorldColorPaletteEntry(
      params.colorPaletteEntries.value,
      entryId
    )
    if (nextEntries === null) {
      return
    }
    params.emitColorPalleteFromEntries(nextEntries)
    if (params.openSwatchIndex.value !== null) {
      params.setOpenSwatchIndex(null)
    }
  }

  return {
    onSwatchColorUpdate,
    onSwatchDelete,
    onSwatchDuplicate,
    wouldSwatchDuplicateExceedMaxLength
  }
}
