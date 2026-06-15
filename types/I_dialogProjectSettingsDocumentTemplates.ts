/** Seconds before delete confirm is enabled in Project Settings destructive menus. */
export const FA_DIALOG_PROJECT_SETTINGS_DELETE_CONFIRM_DELAY_SEC = 5

/** Draft document template row in Project Settings before save. */
export interface I_dialogProjectSettingsDocumentTemplateDraft {
  id: string
  displayName: string
  worldAppendix: string
  icon: string
  documentCount: number
}

/** List row returned by listDocumentTemplatesForProjectSettings IPC. */
export interface I_faProjectDocumentTemplateForProjectSettingsItem {
  createdAtMs: number
  displayName: string
  documentCount: number
  icon: string
  id: string
  sortOrder: number
  updatedAtMs: number
  worldAppendix: string
}

export interface I_faProjectDocumentTemplatesForProjectSettingsResult {
  items: I_faProjectDocumentTemplateForProjectSettingsItem[]
}
