import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

const EMPTY_WORLD_TEMPLATE_LAYOUT: I_dialogProjectSettingsWorldDraft['templateLayout'] = {
  groups: [],
  placements: []
}

export function appendDialogProjectSettingsWorldDraft (
  worlds: I_dialogProjectSettingsWorldDraft[],
  languageCode: T_faUserSettingsLanguageCode,
  defaultDisplayName: string
): I_dialogProjectSettingsWorldDraft[] {
  const id = crypto.randomUUID()
  const displayNameTranslations: I_faProjectWorldDisplayNameTranslations = {
    [languageCode]: defaultDisplayName
  }
  return [
    ...worlds,
    {
      color: '',
      colorPallete: '',
      displayNameTranslations,
      documentCount: 0,
      id,
      templateLayout: EMPTY_WORLD_TEMPLATE_LAYOUT
    }
  ]
}

export function isDialogProjectSettingsWorldRemoveDisabled (
  worlds: I_dialogProjectSettingsWorldDraft[],
  world: I_dialogProjectSettingsWorldDraft
): boolean {
  if (worlds.length <= 1) {
    return true
  }
  return world.documentCount > 0
}
