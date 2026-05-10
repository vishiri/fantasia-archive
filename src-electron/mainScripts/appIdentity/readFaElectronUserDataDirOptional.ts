import { app } from 'electron'

/**
 * Resolves Electron 'userData' for optional file migration before 'electron-store' opens.
 * Returns null when 'app.getPath' is unavailable (for example in bare Vitest without an Electron stub).
 */
export function readFaElectronUserDataDirOptional (): string | null {
  const getPath = app?.getPath
  if (typeof getPath !== 'function') {
    return null
  }
  return getPath.call(app, 'userData')
}
