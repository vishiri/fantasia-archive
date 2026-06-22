import type { ComputedRef } from 'vue'

import { FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES } from 'app/i18n/faUserSettingsLanguageDisplayNames'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import { faUserSettingsLanguageCodeToNamesKey } from 'app/types/faUserSettingsLanguageRegistry'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

import {
  resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey
} from './dialogProjectSettingsWorldTemplateLayoutTreeMissingTranslations'
import { formatFaLocaleSingularPluralMissingTranslationWarningTooltip } from 'app/src/scripts/localeTranslations/functions/formatFaLocaleSingularPluralMissingTranslationWarningTooltip'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring (deps: {
  computed: typeof import('vue').computed
  i18n: {
    global: {
      t: (key: string, params?: Record<string, string>) => string
    }
  }
  readCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  readDocumentTemplates: () => I_dialogProjectSettingsDocumentTemplateDraft[]
  readNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  readNodeTestLocator: () => string
}): {
    missingTranslationsWarningTestLocator: ComputedRef<string>
    missingTranslationsWarningTooltipText: ComputedRef<string>
    showMissingTranslationsWarning: ComputedRef<boolean>
  } {
  const documentTemplateTitleTranslationsById = deps.computed(() => {
    const titleTranslationsById = new Map<
      string,
      Pick<I_dialogProjectSettingsDocumentTemplateDraft, 'titlePluralTranslations' | 'titleSingularTranslations'>
    >()
    for (const template of deps.readDocumentTemplates()) {
      titleTranslationsById.set(template.id, {
        titlePluralTranslations: template.titlePluralTranslations,
        titleSingularTranslations: template.titleSingularTranslations
      })
    }
    return titleTranslationsById
  })

  const missingTranslationsWarningKind = deps.computed(() => {
    const node = deps.readNode()
    const documentTemplateId = node.documentTemplateId
    const templateTitleTranslations = documentTemplateId === null
      ? null
      : documentTemplateTitleTranslationsById.value.get(documentTemplateId) ?? null
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarning({
      documentTemplateTitlePluralTranslations: templateTitleTranslations?.titlePluralTranslations ?? null,
      documentTemplateTitleSingularTranslations: templateTitleTranslations?.titleSingularTranslations ?? null,
      languageCode: deps.readCurrentLanguageCode(),
      node
    })
  })

  const showMissingTranslationsWarning = deps.computed(() => {
    return missingTranslationsWarningKind.value !== null
  })

  const missingTranslationsWarningTooltipText = deps.computed(() => {
    const warning = missingTranslationsWarningKind.value
    const i18nKey = resolveDialogProjectSettingsWorldTemplateLayoutTreeMissingTranslationWarningI18nKey(warning)
    if (i18nKey !== null) {
      return deps.i18n.global.t(i18nKey)
    }
    if (warning === null || warning === 'groupDisplayName') {
      return ''
    }
    return formatFaLocaleSingularPluralMissingTranslationWarningTooltip({
      activeLanguageCode: deps.readCurrentLanguageCode(),
      readFallbackLanguageName: (languageCode) => {
        return FA_USER_SETTINGS_LANGUAGE_DISPLAY_NAMES[faUserSettingsLanguageCodeToNamesKey(languageCode)]
      },
      translate: (key, params) => deps.i18n.global.t(key, params),
      warning: warning.warning
    })
  })

  const missingTranslationsWarningTestLocator = deps.computed(() => {
    return `${deps.readNodeTestLocator()}-missingTranslationsWarning`
  })

  return {
    missingTranslationsWarningTestLocator,
    missingTranslationsWarningTooltipText,
    showMissingTranslationsWarning
  }
}
