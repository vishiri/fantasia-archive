import { app } from 'electron'
import path from 'node:path'

const FA_CONFIG_EXPORT_BASENAME = 'faConfigExport.faconfig'

function e2eAppConfigFileDialogsUseUserData (): boolean {
  return process.env.TEST_ENV === 'e2e'
}

/** Save dialog default: Downloads + suggested `.faconfig` name (bare filename was resolving under Documents on some systems). */
export function getFaAppConfigExportSaveDefaultPath (): string {
  const base = e2eAppConfigFileDialogsUseUserData() ? app.getPath('userData') : app.getPath('downloads')
  return path.join(base, FA_CONFIG_EXPORT_BASENAME)
}

/** Open dialog default folder: Downloads, or the Electron userData path when 'TEST_ENV' is 'e2e' (Playwright). */
export function getFaAppConfigImportOpenDefaultPath (): string {
  return e2eAppConfigFileDialogsUseUserData() ? app.getPath('userData') : app.getPath('downloads')
}
