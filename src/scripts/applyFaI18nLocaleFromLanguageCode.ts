import { i18n } from 'app/i18n/externalFileLoader'
import type { T_faUserSettingsLanguageCode } from 'app/types/T_faUserSettingsLanguageCode'

/**
 * Switches the shared vue-i18n instance (also registered on the Quasar app in boot) to the given locale.
 */
export function applyFaI18nLocaleFromLanguageCode (code: T_faUserSettingsLanguageCode): void {
  i18n.global.locale.value = code
}
