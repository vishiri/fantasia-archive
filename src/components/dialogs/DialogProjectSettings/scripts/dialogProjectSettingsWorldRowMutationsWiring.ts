import type {
  I_dialogProjectSettingsWorldDraft,
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import {
  parseFaProjectWorldColorPaletteToHexListPreservingDuplicates,
  resolveFaProjectWorldStorageHexColor
} from 'app/src/scripts/projectWorlds/functions/faProjectWorldColorPaletteHexList'

import { appendDialogProjectSettingsWorldDraft } from './functions/dialogProjectSettingsWorldsDraft'

function resolveDialogProjectSettingsWorldDraftColor (color: string): string {
  return resolveFaProjectWorldStorageHexColor(color) ?? color
}

function dialogProjectSettingsWorldColorPalettesMatch (
  currentPalette: string,
  nextPalette: string
): boolean {
  const currentHex = parseFaProjectWorldColorPaletteToHexListPreservingDuplicates(currentPalette)
  const nextHex = parseFaProjectWorldColorPaletteToHexListPreservingDuplicates(nextPalette)
  if (currentHex.length !== nextHex.length) {
    return false
  }
  for (let index = 0; index < currentHex.length; index += 1) {
    if (currentHex[index] !== nextHex[index]) {
      return false
    }
  }
  return true
}

export function addDialogProjectSettingsWorldDraftRow (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  languageCode: T_faUserSettingsLanguageCode,
  defaultDisplayName: string
): void {
  if (localWorlds.value === null) {
    return
  }
  localWorlds.value = appendDialogProjectSettingsWorldDraft(
    localWorlds.value,
    languageCode,
    defaultDisplayName
  )
}

export function removeDialogProjectSettingsWorldDraftRow (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string
): void {
  if (localWorlds.value === null) {
    return
  }
  localWorlds.value = localWorlds.value.filter((world) => world.id !== id)
}

export function updateDialogProjectSettingsWorldDraftDisplayNameTranslations (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string,
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): void {
  if (localWorlds.value === null) {
    return
  }
  localWorlds.value = localWorlds.value.map((world) => {
    if (world.id !== id) {
      return world
    }
    return {
      ...world,
      displayNameTranslations
    }
  })
}

export function updateDialogProjectSettingsWorldDraftColor (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string,
  color: string
): void {
  if (localWorlds.value === null) {
    return
  }
  const nextColor = resolveDialogProjectSettingsWorldDraftColor(color)
  const currentWorlds = localWorlds.value
  let colorChanged = false
  const nextWorlds = currentWorlds.map((world) => {
    if (world.id !== id || world.color === nextColor) {
      return world
    }
    colorChanged = true
    return {
      ...world,
      color: nextColor
    }
  })
  if (!colorChanged) {
    return
  }
  localWorlds.value = nextWorlds
}

export function updateDialogProjectSettingsWorldDraftColorPalette (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string,
  colorPalette: string
): void {
  if (localWorlds.value === null) {
    return
  }
  const currentWorlds = localWorlds.value
  let paletteChanged = false
  const nextWorlds = currentWorlds.map((world) => {
    if (world.id !== id || dialogProjectSettingsWorldColorPalettesMatch(world.colorPalette, colorPalette)) {
      return world
    }
    paletteChanged = true
    return {
      ...world,
      colorPalette
    }
  })
  if (!paletteChanged) {
    return
  }
  localWorlds.value = nextWorlds
}

export function updateDialogProjectSettingsWorldDraftTemplateLayout (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string,
  templateLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
): void {
  if (localWorlds.value === null) {
    return
  }
  localWorlds.value = localWorlds.value.map((world) => {
    if (world.id !== id) {
      return world
    }
    return {
      ...world,
      templateLayout
    }
  })
}
