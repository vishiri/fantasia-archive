import { sortFaKeybindMods } from './functions/faKeybindsChordEqualityAndResolve'

import { createFaKeybindsChordFromEvent } from './functions/createFaKeybindsChordFromEvent'

const faKeybindsChordFromEventApi = createFaKeybindsChordFromEvent({
  sortFaKeybindMods
})

export const isFaKeybindModifierPhysicalCode =
  faKeybindsChordFromEventApi.isFaKeybindModifierPhysicalCode

export const isFaKeybindBindableMainKeyCode =
  faKeybindsChordFromEventApi.isFaKeybindBindableMainKeyCode

export const faKeybindMainKeyRequiresModifier =
  faKeybindsChordFromEventApi.faKeybindMainKeyRequiresModifier

export const faKeybindTryChordFromEvent = faKeybindsChordFromEventApi.faKeybindTryChordFromEvent

export const faKeybindEventToChord = faKeybindsChordFromEventApi.faKeybindEventToChord
