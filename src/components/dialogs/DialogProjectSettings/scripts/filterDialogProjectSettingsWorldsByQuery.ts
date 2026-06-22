import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveDialogProjectSettingsWorldResolvedDisplayName } from './dialogProjectSettingsWorldsDisplayNameDraft'

export function filterDialogProjectSettingsWorldsByQuery (
  worlds: I_dialogProjectSettingsWorldDraft[],
  query: string,
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldDraft[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) {
    return worlds
  }

  return worlds.filter((world) => {
    const resolvedDisplayName = resolveDialogProjectSettingsWorldResolvedDisplayName(
      world,
      languageCode
    ).toLowerCase()
    return resolvedDisplayName.includes(needle)
  })
}
