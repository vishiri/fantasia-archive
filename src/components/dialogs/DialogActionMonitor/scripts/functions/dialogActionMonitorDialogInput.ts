import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * True when a direct prop feed should open the action monitor dialog.
 */
export function isDialogActionMonitorDirectInput (
  directInput: T_dialogName | undefined
): directInput is 'ActionMonitor' {
  return directInput === 'ActionMonitor'
}

/**
 * True when centralized dialog routing targets the action monitor dialog.
 */
export function isDialogActionMonitorStoreTarget (
  dialogToOpen: unknown
): dialogToOpen is 'ActionMonitor' {
  return dialogToOpen === 'ActionMonitor'
}
