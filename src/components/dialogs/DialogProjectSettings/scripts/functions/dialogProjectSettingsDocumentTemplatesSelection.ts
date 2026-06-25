import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'

/**
 * First document template id when the list is non-empty; otherwise null.
 */
export function resolveDialogProjectSettingsInitialDocumentTemplateId (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[]
): string | null {
  return templates[0]?.id ?? null
}

/**
 * True when selectedTemplateId is missing or not present in templates.
 */
export function isDialogProjectSettingsDocumentTemplateSelectionInvalid (
  templates: I_dialogProjectSettingsDocumentTemplateDraft[],
  selectedTemplateId: string | null
): boolean {
  if (selectedTemplateId === null) {
    return true
  }
  return !templates.some((template) => template.id === selectedTemplateId)
}

/**
 * After a template is removed, prefer the row at the same index, else the previous row.
 */
export function resolveDialogProjectSettingsDocumentTemplateIdAfterRemove (
  templatesAfterRemove: I_dialogProjectSettingsDocumentTemplateDraft[],
  removedId: string,
  previousSelectedId: string | null,
  templatesBeforeRemove: I_dialogProjectSettingsDocumentTemplateDraft[]
): string | null {
  if (templatesAfterRemove.length === 0) {
    return null
  }
  if (previousSelectedId !== removedId) {
    if (templatesAfterRemove.some((template) => template.id === previousSelectedId)) {
      return previousSelectedId
    }
    return resolveDialogProjectSettingsInitialDocumentTemplateId(templatesAfterRemove)
  }
  const removedIndex = templatesBeforeRemove.findIndex((template) => template.id === removedId)
  if (removedIndex < 0) {
    return resolveDialogProjectSettingsInitialDocumentTemplateId(templatesAfterRemove)
  }
  if (removedIndex < templatesAfterRemove.length) {
    return templatesAfterRemove[removedIndex]!.id
  }
  return templatesAfterRemove[removedIndex - 1]?.id ??
    resolveDialogProjectSettingsInitialDocumentTemplateId(templatesAfterRemove)
}

/**
 * When a template is appended at the end, returns its id if it was not in the previous list.
 */
export function findDialogProjectSettingsNewlyAppendedDocumentTemplateId (
  previousTemplates: I_dialogProjectSettingsDocumentTemplateDraft[],
  nextTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
): string | null {
  const previousIds = new Set(previousTemplates.map((template) => template.id))
  const newTemplates = nextTemplates.filter((template) => !previousIds.has(template.id))
  if (newTemplates.length !== 1) {
    return null
  }
  const appendedTemplate = newTemplates[0]!
  const lastTemplate = nextTemplates[nextTemplates.length - 1]
  if (lastTemplate?.id !== appendedTemplate.id) {
    return null
  }
  return appendedTemplate.id
}

/**
 * Resolves selectedTemplateId after the document templates draft list changes.
 */
export function resolveDialogProjectSettingsDocumentTemplatesPanelSelection (
  nextTemplates: I_dialogProjectSettingsDocumentTemplateDraft[],
  previousTemplates: I_dialogProjectSettingsDocumentTemplateDraft[],
  selectedTemplateId: string | null
): string | null {
  const appendedId = findDialogProjectSettingsNewlyAppendedDocumentTemplateId(
    previousTemplates,
    nextTemplates
  )
  if (appendedId !== null) {
    return appendedId
  }

  if (nextTemplates.length < previousTemplates.length) {
    const removedTemplate = previousTemplates.find((template) => {
      return !nextTemplates.some((candidate) => candidate.id === template.id)
    }) as I_dialogProjectSettingsDocumentTemplateDraft
    return resolveDialogProjectSettingsDocumentTemplateIdAfterRemove(
      nextTemplates,
      removedTemplate.id,
      selectedTemplateId,
      previousTemplates
    )
  }

  if (isDialogProjectSettingsDocumentTemplateSelectionInvalid(nextTemplates, selectedTemplateId)) {
    return resolveDialogProjectSettingsInitialDocumentTemplateId(nextTemplates)
  }

  return selectedTemplateId
}
