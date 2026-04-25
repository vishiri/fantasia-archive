import { app } from 'electron'
import path from 'node:path'

const FA_CONFIG_EXPORT_BASENAME = 'faConfigExport.faconfig'

/** Save dialog default: Downloads + suggested `.faconfig` name (bare filename was resolving under Documents on some systems). */
export function getFaProgramConfigExportSaveDefaultPath (): string {
  return path.join(app.getPath('downloads'), FA_CONFIG_EXPORT_BASENAME)
}

/** Open dialog default folder: Downloads. */
export function getFaProgramConfigImportOpenDefaultPath (): string {
  return app.getPath('downloads')
}
