import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'

/**
 * Runs project creation via the action manager; closes the dialog on success.
 * Success toast comes from 'handleCreateNewProject' so only one notification appears.
 */
export async function runDialogNewProjectCreate (
  projectName: string,
  closeDialog: () => void
): Promise<void> {
  const ok = await runFaActionAwait('createNewProject', { projectName })
  if (!ok) {
    return
  }
  closeDialog()
}
