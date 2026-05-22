import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'

/**
 * Negative toast when the MRU head file for welcome auto-load no longer exists on disk.
 */
export function notifyWelcomeScreenRecentProjectFileMissing (projectName: string): void {
  const message = i18n.global.t(
    'globalFunctionality.faProjectSession.notifyRecentProjectFileMissing',
    { projectName }
  )
  Notify.create({
    message,
    type: 'negative',
    timeout: 10_000
  })
}
