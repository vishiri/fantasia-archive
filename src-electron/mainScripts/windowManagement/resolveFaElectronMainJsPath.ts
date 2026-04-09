import { fileURLToPath } from 'node:url'

/**
 * Absolute path to the main-process script Electron was started with (electron-main.js).
 * Prefer 'process.argv[1]' so the value matches Playwright 'electron.launch' args even when the
 * bundle splits into multiple chunks (where 'import.meta.url' would not name electron-main.js).
 */
export function resolveFaElectronMainJsPath (): string {
  const scriptArg = process.argv[1]
  if (typeof scriptArg === 'string' && scriptArg.length > 0) {
    return scriptArg
  }

  return fileURLToPath(import.meta.url)
}
