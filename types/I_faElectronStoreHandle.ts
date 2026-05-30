/**
 * Minimal electron-store surface used by main-process store factories (avoids NPM types in level-1 functions).
 */
export interface I_faElectronStoreHandle<T> {
  set: (keyOrObject: string | Partial<T>, value?: unknown) => void
  store: T
}
