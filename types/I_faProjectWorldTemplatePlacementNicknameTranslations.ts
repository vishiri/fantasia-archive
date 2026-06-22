import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

/** Max stored length per locale placement nickname override. */
export const FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATION_MAX_LENGTH = 120

/** Per-locale plural placement nickname override strings keyed by interface language code. */
export type I_faProjectWorldTemplatePlacementNicknameTranslations = I_faLocaleStringTranslations

/** Alias for plural placement nickname translations. */
export type I_faProjectWorldTemplatePlacementNicknamePluralTranslations =
  I_faProjectWorldTemplatePlacementNicknameTranslations
