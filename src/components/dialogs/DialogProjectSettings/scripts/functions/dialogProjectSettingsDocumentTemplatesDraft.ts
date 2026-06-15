import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'

/**
 * True when a document template display name field should show error styling.
 */
export function isDialogProjectSettingsDocumentTemplateNameInvalid (
  displayName: string
): boolean {
  return displayName.trim().length === 0
}

/**
 * True when a document template tab row should use validation error styling.
 */
export function isDialogProjectSettingsDocumentTemplateTabValidationError (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return isDialogProjectSettingsDocumentTemplateNameInvalid(template.displayName)
}

/**
 * True when any document template row has an empty trimmed display name.
 */
export function hasDialogProjectSettingsDocumentTemplateNameValidationError (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[] | null
): boolean {
  if (templates === null) {
    return true
  }
  return templates.some((template) => template.displayName.trim().length === 0)
}

/**
 * Resolves the quoted template name used in save-validation messages.
 */
export function resolveDialogProjectSettingsDocumentTemplateSaveErrorDisplayName (
  displayName: string,
  defaultNewTemplateName: string
): string {
  const trimmed = displayName.trim()
  return trimmed.length > 0 ? trimmed : defaultNewTemplateName
}

/**
 * Maps dialog draft rows to the IPC snapshot payload.
 */
export function mapDialogProjectSettingsDocumentTemplatesToSnapshot (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
): I_faProjectDocumentTemplateSnapshotItem[] {
  return templates.map((template) => {
    const item: I_faProjectDocumentTemplateSnapshotItem = {
      displayName: template.displayName.trim(),
      id: template.id
    }
    const trimmedAppendix = template.worldAppendix.trim()
    if (trimmedAppendix.length > 0) {
      item.worldAppendix = trimmedAppendix
    }
    const trimmedIcon = template.icon.trim()
    if (trimmedIcon.length > 0) {
      item.icon = trimmedIcon
    }
    return item
  })
}

/**
 * Appends a new draft document template row at the bottom of the list.
 */
export function appendDialogProjectSettingsDocumentTemplateDraft (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[],
  defaultDisplayName: string
): I_dialogProjectSettingsDocumentTemplateDraft[] {
  const id = crypto.randomUUID()
  return [
    ...templates,
    {
      displayName: defaultDisplayName,
      documentCount: 0,
      icon: '',
      id,
      worldAppendix: ''
    }
  ]
}

/**
 * True when the remove control must stay disabled for this template row.
 */
export function isDialogProjectSettingsDocumentTemplateRemoveDisabled (
  template: I_dialogProjectSettingsDocumentTemplateDraft
): boolean {
  return template.documentCount > 0
}
