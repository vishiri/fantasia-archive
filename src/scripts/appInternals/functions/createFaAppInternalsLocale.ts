import type { I_faUserSettings, T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

export function createFaAppInternalsLocale (deps: {
  applyFaInterfaceTextDirectionFromLanguageCode: (code: T_faUserSettingsLanguageCode) => void
  i18n: {
    global: {
      locale: {
        value: T_faUserSettingsLanguageCode
      }
    }
  }
}): {
    applyFaI18nLocaleFromLanguageCode: (code: T_faUserSettingsLanguageCode) => void
    applyFaUserSettingsLanguageSelection: (
      updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
      languageCode: T_faUserSettingsLanguageCode,
      currentLanguageCode: T_faUserSettingsLanguageCode
    ) => Promise<void>
  } {
  function applyFaI18nLocaleFromLanguageCode (code: T_faUserSettingsLanguageCode): void {
    deps.i18n.global.locale.value = code
    deps.applyFaInterfaceTextDirectionFromLanguageCode(code)
  }

  async function applyFaUserSettingsLanguageSelection (
    updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
    languageCode: T_faUserSettingsLanguageCode,
    currentLanguageCode: T_faUserSettingsLanguageCode
  ): Promise<void> {
    if (languageCode === currentLanguageCode) {
      return
    }

    await updateSettings({
      languageCode
    })
  }

  return {
    applyFaI18nLocaleFromLanguageCode,
    applyFaUserSettingsLanguageSelection
  }
}
