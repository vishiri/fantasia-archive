import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

/**
 * Constructor-style options used by Vitest when constructing an isolated userSettingsStore.
 */
export type T_storeConstructorOptions = {
  name: string
  defaults: I_faUserSettings
}
