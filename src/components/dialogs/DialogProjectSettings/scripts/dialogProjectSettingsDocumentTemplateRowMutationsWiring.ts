import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { appendDialogProjectSettingsDocumentTemplateDraft } from './functions/dialogProjectSettingsDocumentTemplatesDraft'

export function addDialogProjectSettingsDocumentTemplateDraftRow (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  defaultDisplayName: string
): void {
  if (localDocumentTemplates.value === null) {
    return
  }
  localDocumentTemplates.value = appendDialogProjectSettingsDocumentTemplateDraft(
    localDocumentTemplates.value,
    defaultDisplayName
  )
}

export function removeDialogProjectSettingsDocumentTemplateDraftRow (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  id: string
): void {
  if (localDocumentTemplates.value === null) {
    return
  }
  localDocumentTemplates.value = localDocumentTemplates.value.filter(
    (template) => template.id !== id
  )
}

export function updateDialogProjectSettingsDocumentTemplateDraftDisplayName (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  id: string,
  displayName: string
): void {
  if (localDocumentTemplates.value === null) {
    return
  }
  localDocumentTemplates.value = localDocumentTemplates.value.map((template) => {
    if (template.id !== id) {
      return template
    }
    return {
      ...template,
      displayName
    }
  })
}

export function updateDialogProjectSettingsDocumentTemplateDraftWorldAppendix (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  id: string,
  worldAppendix: string
): void {
  if (localDocumentTemplates.value === null) {
    return
  }
  localDocumentTemplates.value = localDocumentTemplates.value.map((template) => {
    if (template.id !== id) {
      return template
    }
    return {
      ...template,
      worldAppendix
    }
  })
}

export function updateDialogProjectSettingsDocumentTemplateDraftIcon (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  id: string,
  icon: string
): void {
  if (localDocumentTemplates.value === null) {
    return
  }
  localDocumentTemplates.value = localDocumentTemplates.value.map((template) => {
    if (template.id !== id) {
      return template
    }
    return {
      ...template,
      icon
    }
  })
}
