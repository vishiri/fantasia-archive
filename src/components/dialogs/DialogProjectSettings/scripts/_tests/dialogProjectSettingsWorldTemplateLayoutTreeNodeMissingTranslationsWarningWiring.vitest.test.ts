import { computed } from 'vue'
import { expect, test } from 'vitest'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring'

const groupNode = {
  children: [],
  displayNameTranslations: { 'en-US': 'Group' },
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder',
  id: 'group-a',
  label: 'Group',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'group' as const,
  templateDisplayName: '',
  usesNickname: false,
  worldAppendix: ''
}

test('Test that missing translations warning wiring resolves group tooltip for active locale gaps', () => {
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    readCurrentLanguageCode: () => 'de',
    readDocumentTemplates: () => [],
    readNode: () => groupNode,
    readNodeTestLocator: () => 'dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a'
  })

  expect(wiring.showMissingTranslationsWarning.value).toBe(true)
  expect(wiring.missingTranslationsWarningTestLocator.value).toBe(
    'dialogProjectSettings-worldTemplateLayoutTreeNode-group-group-a-missingTranslationsWarning'
  )
  expect(wiring.missingTranslationsWarningTooltipText.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.missingGroupDisplayNameTreeTooltip'
  )
})

test('Test that missing translations warning wiring resolves unknown template title map entry', () => {
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    readCurrentLanguageCode: () => 'de',
    readDocumentTemplates: () => [],
    readNode: () => ({
      ...groupNode,
      documentTemplateId: 'missing-template',
      nodeKind: 'template' as const,
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
    }),
    readNodeTestLocator: () => 'dialogProjectSettings-worldTemplateLayoutTreeNode-template-placement-a'
  })

  expect(wiring.showMissingTranslationsWarning.value).toBe(false)
  expect(wiring.missingTranslationsWarningTooltipText.value).toBe('')
})
