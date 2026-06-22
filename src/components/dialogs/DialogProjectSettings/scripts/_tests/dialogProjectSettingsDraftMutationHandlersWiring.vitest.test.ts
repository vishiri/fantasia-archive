import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { buildDialogProjectSettingsDocumentTemplateDraft } from '../../_tests/dialogProjectSettingsDocumentTemplateDraftFixtures'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { createDialogProjectSettingsDraftMutationHandlers } from '../dialogProjectSettingsDraftMutationHandlersWiring'

const baseWorld: I_dialogProjectSettingsWorldDraft = {
  color: '',
  colorPallete: '',
  displayNameTranslations: { 'en-US': 'Realm' },
  documentCount: 0,
  id: '550e8400-e29b-41d4-a716-446655440000',
  templateLayout: createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
}

const baseTemplate = buildDialogProjectSettingsDocumentTemplateDraft()

/**
 * createDialogProjectSettingsDraftMutationHandlers
 * Wires document template and world draft mutations through shared refs.
 */
test('Test that createDialogProjectSettingsDraftMutationHandlers mutates template and world drafts', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld])
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  const handlers = createDialogProjectSettingsDraftMutationHandlers({
    getCurrentLanguageCode: () => 'en-US',
    resolveNewTemplateDefaultDisplayName: () => 'New template',
    resolveNewWorldDefaultDisplayName: () => 'New world'
  }, {
    localDocumentTemplates,
    localWorlds
  })

  handlers.addWorld()
  handlers.addDocumentTemplate()
  expect(localWorlds.value).toHaveLength(2)
  expect(localDocumentTemplates.value).toHaveLength(2)

  const addedWorldId = localWorlds.value?.[1].id as string
  const addedTemplateId = localDocumentTemplates.value?.[1].id as string

  handlers.updateWorldDisplayNameTranslations(addedWorldId, { 'en-US': 'Renamed world' })
  handlers.updateWorldColor(addedWorldId, '#aabbcc')
  handlers.updateWorldColorPallete(addedWorldId, '#112233')
  handlers.updateWorldTemplateLayout(addedWorldId, {
    groups: [
      {
        displayName: 'Creatures',
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        rootSortOrder: 0
      }
    ],
    placements: []
  })
  handlers.updateDocumentTemplateTitleTranslations(addedTemplateId, { 'en-US': 'Renamed template' })
  handlers.updateDocumentTemplateIcon(addedTemplateId, 'person')
  handlers.updateDocumentTemplateWorldAppendixTranslations(addedTemplateId, { 'en-US': 'Notes' })

  const layoutWithTemplatePlacement: I_dialogProjectSettingsWorldDraft['templateLayout'] = {
    groups: [],
    placements: [
      {
        documentCountInWorld: 0,
        documentTemplateId: baseTemplate.id,
        groupId: null,
        groupSortOrder: null,
        icon: '',
        id: '880e8400-e29b-41d4-a716-446655440001',
        nickname: '',
        rootSortOrder: 0,
        templateDisplayName: 'Character',
        worldAppendix: ''
      }
    ]
  }
  handlers.updateWorldTemplateLayout(baseWorld.id, layoutWithTemplatePlacement)
  handlers.updateDocumentTemplateTitleTranslations(baseTemplate.id, { 'en-US': 'Synced template name' })

  expect(localWorlds.value?.[0].templateLayout.placements[0]?.templateDisplayName).toBe('Synced template name')

  expect(localWorlds.value?.[1].displayNameTranslations).toEqual({ 'en-US': 'Renamed world' })
  expect(localWorlds.value?.[1].color).toBe('#aabbcc')
  expect(localWorlds.value?.[1].colorPallete).toBe('#112233')
  expect(localWorlds.value?.[1].templateLayout.groups).toHaveLength(1)
  expect(localDocumentTemplates.value?.[1].titleTranslations).toEqual({ 'en-US': 'Renamed template' })
  expect(localDocumentTemplates.value?.[1].icon).toBe('person')
  expect(localDocumentTemplates.value?.[1].worldAppendixTranslations).toEqual({ 'en-US': 'Notes' })
  expect(localDocumentTemplates.value?.[0].titleTranslations).toEqual({ 'en-US': 'Synced template name' })

  handlers.removeWorld(baseWorld.id)
  handlers.removeDocumentTemplate(baseTemplate.id)
  expect(localWorlds.value?.map((world) => world.id)).toEqual([addedWorldId])
  expect(localDocumentTemplates.value?.map((template) => template.id)).toEqual([addedTemplateId])
})

test('Test that createDialogProjectSettingsDraftMutationHandlers resolves default names when rows are added', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([])
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([])
  let worldDefault = 'Neue Welt'
  let templateDefault = 'Neue Dokumentvorlage'
  const handlers = createDialogProjectSettingsDraftMutationHandlers({
    getCurrentLanguageCode: () => 'de',
    resolveNewTemplateDefaultDisplayName: () => templateDefault,
    resolveNewWorldDefaultDisplayName: () => worldDefault
  }, {
    localDocumentTemplates,
    localWorlds
  })

  handlers.addWorld()
  handlers.addDocumentTemplate()
  expect(localWorlds.value?.[0]?.displayNameTranslations).toEqual({ de: 'Neue Welt' })
  expect(localDocumentTemplates.value?.[0]?.titleTranslations).toEqual({
    de: 'Neue Dokumentvorlage'
  })

  worldDefault = 'Zweite Welt'
  templateDefault = 'Zweite Vorlage'
  handlers.addWorld()
  handlers.addDocumentTemplate()
  expect(localWorlds.value?.[1]?.displayNameTranslations).toEqual({ de: 'Zweite Welt' })
  expect(localDocumentTemplates.value?.[1]?.titleTranslations).toEqual({
    de: 'Zweite Vorlage'
  })
})
