import type {
  I_dialogProjectSettingsWorldDraft,
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { appendDialogProjectSettingsWorldDraft } from './functions/dialogProjectSettingsWorldsDraft'

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
  localWorlds.value = localWorlds.value.map((world) => {
    if (world.id !== id) {
      return world
    }
    return {
      ...world,
      color
    }
  })
}

export function updateDialogProjectSettingsWorldDraftColorPallete (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string,
  colorPallete: string
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
      colorPallete
    }
  })
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
