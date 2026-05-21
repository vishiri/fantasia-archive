import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'

/**
 * Reopens the active session file from the 404 page (same action path as welcome Resume Latest primary segment).
 */
export function errorNotFoundResumeCurrentProjectClick (
  filePath: string | undefined
): void {
  if (filePath === undefined || filePath.trim().length === 0) {
    return
  }

  void runFaAction('loadExistingProject', { filePath })
}
