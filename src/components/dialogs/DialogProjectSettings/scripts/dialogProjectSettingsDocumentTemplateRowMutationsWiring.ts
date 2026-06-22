import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import { appendDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplatesDraft'

export function addDialogProjectSettingsDocumentTemplateDraftRow (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  languageCode: T_faUserSettingsLanguageCode,
  defaultDisplayName: string
): void {
  if (localDocumentTemplates.value === null) {
    return
  }
  localDocumentTemplates.value = appendDialogProjectSettingsDocumentTemplateDraft(
    localDocumentTemplates.value,
    languageCode,
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

export function updateDialogProjectSettingsDocumentTemplateDraftTitleTranslations (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  id: string,
  titleTranslations: I_faProjectDocumentTemplateTitleTranslations
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
      titleTranslations
    }
  })
}

export function updateDialogProjectSettingsDocumentTemplateDraftWorldAppendixTranslations (
  localDocumentTemplates: Ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>,
  id: string,
  worldAppendixTranslations: I_faProjectDocumentTemplateWorldAppendixTranslations
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
      worldAppendixTranslations
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
