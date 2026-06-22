import type { I_faLocaleSingularPluralMissingTranslationWarning } from 'app/types/I_faLocaleSingularPluralMissingTranslationWarning'

/** Missing per-locale translation warning shown on world template layout tree rows. */
export type T_dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning =
  | 'groupDisplayName'
  | {
    kind: 'documentTemplateTitle' | 'placementNickname'
    warning: I_faLocaleSingularPluralMissingTranslationWarning
  }
