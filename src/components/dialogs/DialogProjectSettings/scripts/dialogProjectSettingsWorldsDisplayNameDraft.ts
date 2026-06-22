import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import {
  hasFaProjectWorldDisplayNameTranslation,
  normalizeFaProjectWorldDisplayNameTranslations,
  resolveFaProjectWorldDisplayName,
  resolveFaProjectWorldDisplayNameLanguageCode
} from 'app/src/scripts/projectWorlds/faProjectWorldDisplayName_manager'

export function resolveDialogProjectSettingsWorldResolvedDisplayName (
  world: Pick<I_dialogProjectSettingsWorldDraft, 'displayNameTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): string {
  return resolveFaProjectWorldDisplayName(world.displayNameTranslations, languageCode)
}

export function resolveDialogProjectSettingsWorldResolvedDisplayNameLanguageCode (
  world: Pick<I_dialogProjectSettingsWorldDraft, 'displayNameTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): T_faUserSettingsLanguageCode | null {
  return resolveFaProjectWorldDisplayNameLanguageCode(world.displayNameTranslations, languageCode)
}

export function isDialogProjectSettingsWorldResolvedDisplayNameUsingFallback (
  world: Pick<I_dialogProjectSettingsWorldDraft, 'displayNameTranslations'>,
  languageCode: T_faUserSettingsLanguageCode
): boolean {
  const resolvedLanguageCode = resolveDialogProjectSettingsWorldResolvedDisplayNameLanguageCode(
    world,
    languageCode
  )
  return resolvedLanguageCode !== null && resolvedLanguageCode !== languageCode
}

export function isDialogProjectSettingsWorldNameInvalid (
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): boolean {
  return !hasFaProjectWorldDisplayNameTranslation(displayNameTranslations)
}

export function resolveDialogProjectSettingsWorldSaveErrorDisplayName (
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations,
  languageCode: T_faUserSettingsLanguageCode,
  defaultNewWorldName: string
): string {
  const resolved = resolveDialogProjectSettingsWorldResolvedDisplayName(
    { displayNameTranslations },
    languageCode
  )
  return resolved.length > 0 ? resolved : defaultNewWorldName
}

export function normalizeDialogProjectSettingsWorldDisplayNameTranslations (
  displayNameTranslations: I_faProjectWorldDisplayNameTranslations
): I_faProjectWorldDisplayNameTranslations {
  return normalizeFaProjectWorldDisplayNameTranslations(displayNameTranslations)
}
