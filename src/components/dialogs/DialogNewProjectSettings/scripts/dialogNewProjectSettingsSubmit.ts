import { Notify } from 'quasar'

import { i18n } from 'app/i18n/externalFileLoader'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'

/**
 * Runs project creation via the action manager; closes the dialog and shows a positive toast on success.
 */
export async function runDialogNewProjectSettingsCreate (
  projectName: string,
  closeDialog: () => void
): Promise<void> {
  const ok = await runFaActionAwait('createNewProject', { projectName })
  if (!ok) {
    return
  }
  Notify.create({
    message: i18n.global.t('dialogs.newProjectSettings.notifyCreated'),
    type: 'positive'
  })
  closeDialog()
}
