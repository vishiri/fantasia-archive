import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * True when a direct prop feed should open the About Fantasia Archive dialog.
 */
export function isDialogAboutFantasiaArchiveDirectInput (
  directInput: T_dialogName | undefined
): directInput is 'AboutFantasiaArchive' {
  return directInput === 'AboutFantasiaArchive'
}

/**
 * True when centralized dialog routing targets About Fantasia Archive.
 */
export function isDialogAboutFantasiaArchiveStoreTarget (
  dialogToOpen: unknown
): dialogToOpen is 'AboutFantasiaArchive' {
  return dialogToOpen === 'AboutFantasiaArchive'
}
