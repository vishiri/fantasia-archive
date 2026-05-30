import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * True when a direct prop feed should open the new project dialog.
 */
export function isDialogNewProjectDirectInput (
  directInput: T_dialogName | undefined
): directInput is 'NewProject' {
  return directInput === 'NewProject'
}

/**
 * True when centralized dialog routing targets the new project dialog.
 */
export function isDialogNewProjectStoreTarget (
  dialogToOpen: unknown
): dialogToOpen is 'NewProject' {
  return dialogToOpen === 'NewProject'
}
