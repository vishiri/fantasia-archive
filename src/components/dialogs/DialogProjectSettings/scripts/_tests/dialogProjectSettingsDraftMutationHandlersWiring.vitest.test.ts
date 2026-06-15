import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { createDialogProjectSettingsDraftMutationHandlers } from '../dialogProjectSettingsDraftMutationHandlersWiring'

const baseWorld: I_dialogProjectSettingsWorldDraft = {
  color: '',
  colorPallete: '',
  displayName: 'Realm',
  documentCount: 0,
  id: '550e8400-e29b-41d4-a716-446655440000'
}

const baseTemplate: I_dialogProjectSettingsDocumentTemplateDraft = {
  displayName: 'Character',
  documentCount: 0,
  icon: '',
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  worldAppendix: ''
}

/**
 * createDialogProjectSettingsDraftMutationHandlers
 * Wires document template and world draft mutations through shared refs.
 */
test('Test that createDialogProjectSettingsDraftMutationHandlers mutates template and world drafts', () => {
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>([baseWorld])
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>([baseTemplate])
  const handlers = createDialogProjectSettingsDraftMutationHandlers({
    newTemplateDefaultDisplayName: 'New template',
    newWorldDefaultDisplayName: 'New world'
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

  handlers.updateWorldDisplayName(addedWorldId, 'Renamed world')
  handlers.updateWorldColor(addedWorldId, '#aabbcc')
  handlers.updateWorldColorPallete(addedWorldId, '#112233')
  handlers.updateDocumentTemplateDisplayName(addedTemplateId, 'Renamed template')
  handlers.updateDocumentTemplateIcon(addedTemplateId, 'person')
  handlers.updateDocumentTemplateWorldAppendix(addedTemplateId, 'Notes')

  expect(localWorlds.value?.[1].displayName).toBe('Renamed world')
  expect(localWorlds.value?.[1].color).toBe('#aabbcc')
  expect(localWorlds.value?.[1].colorPallete).toBe('#112233')
  expect(localDocumentTemplates.value?.[1].displayName).toBe('Renamed template')
  expect(localDocumentTemplates.value?.[1].icon).toBe('person')
  expect(localDocumentTemplates.value?.[1].worldAppendix).toBe('Notes')

  handlers.removeWorld(baseWorld.id)
  handlers.removeDocumentTemplate(baseTemplate.id)
  expect(localWorlds.value?.map((world) => world.id)).toEqual([addedWorldId])
  expect(localDocumentTemplates.value?.map((template) => template.id)).toEqual([addedTemplateId])
})
