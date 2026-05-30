import { app } from 'electron'
import path from 'node:path'

/**
 * Save dialog default folder: Downloads, or userData when TEST_ENV is e2e (Playwright).
 */
export function faProjectSaveDialogDefaultDirectory (): string {
  return process.env.TEST_ENV === 'e2e' ? app.getPath('userData') : app.getPath('downloads')
}

/**
 * Full default path for save dialog: directory + suggestedBasename (basename should include .faproject).
 */
export function getFaProjectSaveDefaultPath (suggestedBasename: string): string {
  const baseDir = faProjectSaveDialogDefaultDirectory()
  return path.join(baseDir, suggestedBasename)
}
