import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

/**
 * Stable tuple when spellchange bookkeeping applies; pairs `prior` → `next` with both defined.
 */
export function resolveGlobalLanguageSelectorAppliedPair (
  next: T_faUserSettingsLanguageCode | undefined,
  prior: T_faUserSettingsLanguageCode | undefined
): readonly [T_faUserSettingsLanguageCode, T_faUserSettingsLanguageCode] | null {
  if (next === undefined) {
    return null
  }
  if (prior === undefined) {
    return null
  }
  if (prior === next) {
    return null
  }
  return [prior, next]
}

/** True exactly when resolveGlobalLanguageSelectorAppliedPair would return non-null. */
export function globalLanguageSelectorShouldNotifyLanguageApplied (
  next: T_faUserSettingsLanguageCode | undefined,
  prior: T_faUserSettingsLanguageCode | undefined
): boolean {
  return resolveGlobalLanguageSelectorAppliedPair(next, prior) !== null
}
