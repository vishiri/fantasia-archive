import ElectronStore from 'electron-store'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'

let faUserSettings: ElectronStore<I_faUserSettings> | null = null

/**
 * Lazily creates the main-process settings store. Call only after 'app.whenReady()'
 * (or from within that callback) so Electron 'userData' paths resolve.
 */
export const getFaUserSettings = (): ElectronStore<I_faUserSettings> => {
  if (faUserSettings === null) {
    faUserSettings = new ElectronStore<I_faUserSettings>({
      name: 'faUserSettings',
      defaults: {
        theme: 'light',
      }
    })
  }
  return faUserSettings
}
