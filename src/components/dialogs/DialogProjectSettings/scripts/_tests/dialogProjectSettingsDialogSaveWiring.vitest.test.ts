import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

import { persistDialogProjectSettingsDraft } from '../dialogProjectSettingsDialogSaveWiring'

const savedSettings: I_faProjectSettingsRoot = {
  projectName: 'Saved',
  schemaVersion: 1
}

const savedWorlds: I_dialogProjectSettingsWorldDraft[] = [
  {
    color: '',
    colorPalette: '',
    displayNameTranslations: { 'en-US': 'World' },
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    },
    id: '550e8400-e29b-41d4-a716-446655440000'
  }
]

const savedTemplates: I_dialogProjectSettingsDocumentTemplateDraft[] = [
  {
    documentCount: 0,
    icon: 'mdi-file',
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titlePluralTranslations: { 'en-US': 'Notes' },
    titleSingularTranslations: {},
    worldAppendixTranslations: { 'en-US': 'Appendix' }
  }
]

test('Test that persistDialogProjectSettingsDraft keeps edits made during save dirty', async () => {
  let finishSave: ((saved: boolean) => void) | undefined
  const pendingSave = new Promise<boolean>((resolve) => {
    finishSave = resolve
  })
  const patchedHide: boolean[] = []
  const localSettings = ref<I_faProjectSettingsRoot | null>({ ...savedSettings })
  const localWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(savedWorlds)
  const localDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(
    savedTemplates
  )
  const baselineSettings = ref<I_faProjectSettingsRoot | null>(null)
  const baselineWorlds = ref<I_dialogProjectSettingsWorldDraft[] | null>(null)
  const baselineDocumentTemplates = ref<I_dialogProjectSettingsDocumentTemplateDraft[] | null>(null)
  const savePromise = persistDialogProjectSettingsDraft({
    patchHideHierarchyTreeSilently: async (hideHierarchyTree) => {
      patchedHide.push(hideHierarchyTree)
    },
    runFaActionAwait: async () => pendingSave
  }, {
    baselineDocumentTemplates,
    baselineSettings,
    baselineWorlds,
    hadWorldTemplatePlacementsAtDialogOpen: ref(false),
    localDocumentTemplates,
    localSettings,
    localWorlds
  })
  localSettings.value = {
    projectName: 'Typed during save',
    schemaVersion: 1
  }
  const savedWorld = savedWorlds[0]
  if (savedWorld === undefined) {
    throw new Error('missing saved world')
  }
  localWorlds.value = [
    {
      ...savedWorld,
      templateLayout: {
        groups: [],
        placements: [{
          categoryCountInWorld: 0,
          documentCountInWorld: 0,
          documentTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          groupId: null,
          groupSortOrder: null,
          icon: 'mdi-file',
          id: 'placement-1',
          nicknamePluralTranslations: {},
          nicknameSingularTranslations: {},
          rootSortOrder: 0,
          templateDisplayName: 'Notes',
          worldAppendix: ''
        }]
      }
    }
  ]
  const finish = finishSave
  if (finish === undefined) {
    throw new Error('missing save resolver')
  }
  finish(true)
  await savePromise
  expect(baselineSettings.value).toEqual(savedSettings)
  expect(localSettings.value.projectName).toBe('Typed during save')
  expect(patchedHide).toEqual([true])
})

test('Test that persistDialogProjectSettingsDraft clears the save tail when save rejects', async () => {
  await expect(persistDialogProjectSettingsDraft({
    patchHideHierarchyTreeSilently: async () => undefined,
    runFaActionAwait: async () => {
      throw new Error('settings-save-fail')
    }
  }, {
    baselineDocumentTemplates: ref(savedTemplates),
    baselineSettings: ref(savedSettings),
    baselineWorlds: ref(savedWorlds),
    hadWorldTemplatePlacementsAtDialogOpen: ref(false),
    localDocumentTemplates: ref(savedTemplates),
    localSettings: ref(savedSettings),
    localWorlds: ref(savedWorlds)
  })).rejects.toThrow('settings-save-fail')
  await expect(persistDialogProjectSettingsDraft({
    patchHideHierarchyTreeSilently: async () => undefined,
    runFaActionAwait: async () => true
  }, {
    baselineDocumentTemplates: ref(savedTemplates),
    baselineSettings: ref(savedSettings),
    baselineWorlds: ref(savedWorlds),
    hadWorldTemplatePlacementsAtDialogOpen: ref(false),
    localDocumentTemplates: ref(savedTemplates),
    localSettings: ref(savedSettings),
    localWorlds: ref(savedWorlds)
  })).resolves.toBe(true)
})
