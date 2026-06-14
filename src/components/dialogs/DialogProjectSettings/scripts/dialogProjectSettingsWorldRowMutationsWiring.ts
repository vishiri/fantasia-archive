import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { appendDialogProjectSettingsWorldDraft } from './functions/dialogProjectSettingsWorldsDraft'

export function addDialogProjectSettingsWorldDraftRow (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  defaultDisplayName: string
): void {
  if (localWorlds.value === null) {
    return
  }
  localWorlds.value = appendDialogProjectSettingsWorldDraft(
    localWorlds.value,
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

export function updateDialogProjectSettingsWorldDraftDisplayName (
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>,
  id: string,
  displayName: string
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
      displayName
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
