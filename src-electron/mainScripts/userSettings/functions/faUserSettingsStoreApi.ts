import type { I_faUserSettingsStoreApiDeps } from 'app/types/I_faElectronMainStoreApiDeps'
import type { I_faElectronStoreHandle } from 'app/types/I_faElectronStoreHandle'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

function faUserSettingsNeedRewrite (
  currentSettings: Record<string, unknown>,
  sanitized: I_faUserSettings,
  hadUnexpectedKeys: boolean
): boolean {
  if (hadUnexpectedKeys) {
    return true
  }
  const sanitizedRecord = sanitized as unknown as Record<string, unknown>
  return Object.keys(currentSettings).some((key) => {
    return currentSettings[key] !== sanitizedRecord[key]
  })
}

/**
 * Removes persisted keys that no longer exist in defaults and rewrites the settings file once per launch when stale/unknown keys are found.
 */
export function createFaUserSettingsStoreApi (deps: I_faUserSettingsStoreApiDeps): {
  cleanup: (store: I_faElectronStoreHandle<I_faUserSettings>) => void
  get: () => I_faElectronStoreHandle<I_faUserSettings>
} {
  const cleanup = (store: I_faElectronStoreHandle<I_faUserSettings>): void => {
    const currentSettings = (store.store ?? {}) as Partial<I_faUserSettings> & Record<string, unknown>
    const hadUnexpectedKeysBeforeMigrate = Object.keys(currentSettings)
      .some((key) => !(key in deps.defaults))
    const migrated = deps.migrateLegacyFaUserSettingsKeys(currentSettings)
    const {
      sanitized
    } = deps.buildSanitizedFaUserSettings(
      migrated as Partial<I_faUserSettings>,
      deps.defaults,
      deps.isFaUserSettingsAppTheme,
      deps.isFaUserSettingsLanguageCode
    )
    if (faUserSettingsNeedRewrite(currentSettings, sanitized, hadUnexpectedKeysBeforeMigrate)) {
      store.store = sanitized
    }
  }

  const get = deps.createLazySingleton((): I_faElectronStoreHandle<I_faUserSettings> => {
    const store = new deps.ElectronStore({
      defaults: { ...deps.defaults },
      name: deps.storeName
    })
    cleanup(store)
    return store
  })

  return {
    cleanup,
    get
  }
}
