import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/** Vertical tab id for the General settings category in Project Settings. */
export const FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB = 'generalSettings'

/** Vertical tab id for the Worlds settings category in Project Settings. */
export const FA_DIALOG_PROJECT_SETTINGS_WORLDS_TAB = 'worldsSettings'

/**
 * True when a direct prop feed should open Project Settings.
 */
export function isDialogProjectSettingsDirectInput (
  directInput: T_dialogName | undefined
): directInput is 'ProjectSettings' {
  return directInput === 'ProjectSettings'
}

/**
 * True when centralized dialog routing targets Project Settings.
 */
export function isDialogProjectSettingsStoreTarget (
  dialogToOpen: unknown
): dialogToOpen is 'ProjectSettings' {
  return dialogToOpen === 'ProjectSettings'
}

/**
 * True when Save should stay disabled for the current project name draft.
 */
export function isDialogProjectSettingsSaveDisabled (projectName: string): boolean {
  return projectName.trim().length === 0
}
