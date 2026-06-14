import type { I_dialogProjectSettingsWorldColorPaletteEntry } from 'app/types/I_dialogProjectSettingsWorlds'

export function buildDialogProjectSettingsWorldColorPaletteEntries (
  hexList: readonly string[],
  createEntryId: () => string
): I_dialogProjectSettingsWorldColorPaletteEntry[] {
  const entries: I_dialogProjectSettingsWorldColorPaletteEntry[] = []
  for (const hex of hexList) {
    entries.push({
      hex,
      id: createEntryId()
    })
  }
  return entries
}

export function replaceDialogProjectSettingsWorldColorPaletteEntryHex (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
  entryId: string,
  hex: string
): I_dialogProjectSettingsWorldColorPaletteEntry[] {
  return entries.map((entry) => {
    if (entry.id !== entryId) {
      return entry
    }
    return {
      ...entry,
      hex
    }
  })
}

export function appendDialogProjectSettingsWorldColorPaletteEntry (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
  createEntryId: () => string,
  appendHex: string
): I_dialogProjectSettingsWorldColorPaletteEntry[] {
  return [
    ...entries,
    {
      hex: appendHex,
      id: createEntryId()
    }
  ]
}

export function duplicateDialogProjectSettingsWorldColorPaletteEntryAfter (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
  entryId: string,
  createEntryId: () => string
): I_dialogProjectSettingsWorldColorPaletteEntry[] | null {
  const sourceIndex = entries.findIndex((entry) => entry.id === entryId)
  if (sourceIndex === -1) {
    return null
  }
  const sourceEntry = entries[sourceIndex]
  const duplicatedEntry: I_dialogProjectSettingsWorldColorPaletteEntry = {
    hex: sourceEntry.hex,
    id: createEntryId()
  }
  return [
    ...entries.slice(0, sourceIndex + 1),
    duplicatedEntry,
    ...entries.slice(sourceIndex + 1)
  ]
}

export function removeDialogProjectSettingsWorldColorPaletteEntry (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
  entryId: string
): I_dialogProjectSettingsWorldColorPaletteEntry[] | null {
  const nextEntries = entries.filter((entry) => entry.id !== entryId)
  if (nextEntries.length === entries.length) {
    return null
  }
  return nextEntries
}

export function wouldDuplicateDialogProjectSettingsWorldColorPaletteEntryExceedMaxLength (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
  entryId: string,
  serializeFaProjectWorldColorPalleteFromHexList: (
    hexList: readonly string[]
  ) => string,
  wouldFaProjectWorldColorPalleteExceedMaxLength: (
    colorPallete: string,
    appendHex: string,
    maxLength: number
  ) => boolean,
  maxLength: number
): boolean {
  const sourceEntry = entries.find((entry) => entry.id === entryId)
  if (sourceEntry === undefined) {
    return true
  }
  const currentSerialized = serializeFaProjectWorldColorPalleteFromHexList(
    readDialogProjectSettingsWorldColorPaletteEntryHexList(entries)
  )
  return wouldFaProjectWorldColorPalleteExceedMaxLength(
    currentSerialized,
    sourceEntry.hex,
    maxLength
  )
}

export function readDialogProjectSettingsWorldColorPaletteEntryHexList (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[]
): string[] {
  return entries.map((entry) => entry.hex)
}

export function isDialogProjectSettingsWorldColorPaletteSwatchDuplicate (
  hex: string,
  duplicateHexKeys: ReadonlySet<string>
): boolean {
  return duplicateHexKeys.has(hex.trim().toLowerCase())
}

export function shouldResyncDialogProjectSettingsWorldColorPaletteFromProp (
  entries: readonly I_dialogProjectSettingsWorldColorPaletteEntry[],
  colorPallete: string,
  serializeFaProjectWorldColorPalleteFromHexList: (
    hexList: readonly string[]
  ) => string
): boolean {
  const trimmedNext = colorPallete.trim()
  const currentSerialized = serializeFaProjectWorldColorPalleteFromHexList(
    readDialogProjectSettingsWorldColorPaletteEntryHexList(entries)
  )
  return currentSerialized !== trimmedNext
}
