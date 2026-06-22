import { ref } from 'vue'
import { expect, test } from 'vitest'

import { syncDialogProjectSettingsDocumentTemplateLayoutTitles } from '../dialogProjectSettingsDocumentTemplateLayoutTitleSyncWiring'
import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'

/**
 * syncDialogProjectSettingsDocumentTemplateLayoutTitles
 * Updates placement display names when template title translations change.
 */
test('Test that syncDialogProjectSettingsDocumentTemplateLayoutTitles updates placement display names', () => {
  const template = buildDialogProjectSettingsDocumentTemplateDraft({
    id: 'template-a',
    titleTranslations: {
      'en-US': 'Character',
      de: 'Held'
    }
  })
  const localDocumentTemplates = ref([template])
  const localWorlds = ref([
    {
      color: '#808080',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-a',
      templateLayout: {
        groups: [],
        placements: [
          {
            documentCountInWorld: 0,
            documentTemplateId: 'template-a',
            groupId: null,
            groupSortOrder: null,
            icon: '',
            id: 'placement-a',
            nickname: '',
            rootSortOrder: 0,
            templateDisplayName: 'Character',
            worldAppendix: ''
          }
        ]
      }
    }
  ])

  syncDialogProjectSettingsDocumentTemplateLayoutTitles({
    documentTemplateId: 'template-a',
    getCurrentLanguageCode: () => 'de',
    localDocumentTemplates,
    localWorlds
  })

  expect(localWorlds.value?.[0]?.templateLayout.placements[0]?.templateDisplayName).toBe('Held')
})

test('Test that syncDialogProjectSettingsDocumentTemplateLayoutTitles no-ops when drafts are null', () => {
  const localDocumentTemplates = ref(null)
  const localWorlds = ref(null)

  syncDialogProjectSettingsDocumentTemplateLayoutTitles({
    documentTemplateId: 'template-a',
    getCurrentLanguageCode: () => 'en-US',
    localDocumentTemplates,
    localWorlds
  })

  expect(localWorlds.value).toBeNull()
})

test('Test that syncDialogProjectSettingsDocumentTemplateLayoutTitles no-ops when only document templates are null', () => {
  const localDocumentTemplates = ref(null)
  const localWorlds = ref([
    {
      color: '#808080',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-a',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])

  syncDialogProjectSettingsDocumentTemplateLayoutTitles({
    documentTemplateId: 'template-a',
    getCurrentLanguageCode: () => 'en-US',
    localDocumentTemplates,
    localWorlds
  })

  expect(localWorlds.value?.[0]?.templateLayout.placements).toEqual([])
})

test('Test that syncDialogProjectSettingsDocumentTemplateLayoutTitles no-ops when template id is missing', () => {
  const localDocumentTemplates = ref([
    buildDialogProjectSettingsDocumentTemplateDraft({ id: 'other-template' })
  ])
  const localWorlds = ref([
    {
      color: '#808080',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Realm' },
      documentCount: 0,
      id: 'world-a',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ])

  syncDialogProjectSettingsDocumentTemplateLayoutTitles({
    documentTemplateId: 'template-a',
    getCurrentLanguageCode: () => 'en-US',
    localDocumentTemplates,
    localWorlds
  })

  expect(localWorlds.value?.[0]?.templateLayout.placements).toEqual([])
})
