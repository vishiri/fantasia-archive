import { ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/faUserSettingsDefaults'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  syncLocalProgramSettingsFromStore,
  updateLocalProgramSetting
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsLocalSettingsManagement'

/**
 * updateLocalProgramSetting
 * No-ops when the local settings ref is still null.
 */
test('updateLocalProgramSetting returns early when localSettings is null', () => {
  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  updateLocalProgramSetting(localSettings, programSettingsTree, 'showDocumentID', true)

  expect(localSettings.value).toBe(null)
})

/**
 * updateLocalProgramSetting
 * Updates both the flat settings snapshot and the matching render-tree toggle for a known key.
 */
test('updateLocalProgramSetting writes localSettings and programSettingsTree for showDocumentID', () => {
  const localSettings = ref<I_faUserSettings | null>({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const programSettingsTree = ref<T_programSettingsRenderTree>({
    developerSettings: {
      subCategories: {
        documentBody: {
          settingsList: {
            showDocumentID: {
              description: '',
              tags: '',
              title: 'Show document ID',
              value: false
            }
          },
          title: 'Document body'
        }
      },
      title: 'Developer'
    }
  })

  updateLocalProgramSetting(localSettings, programSettingsTree, 'showDocumentID', true)

  expect(localSettings.value?.showDocumentID).toBe(true)
  expect(
    programSettingsTree.value.developerSettings?.subCategories.documentBody?.settingsList
      .showDocumentID?.value
  ).toBe(true)
})

/**
 * syncLocalProgramSettingsFromStore
 * Returns immediately when no Pinia store is available from the resolver.
 */
test('syncLocalProgramSettingsFromStore returns when resolveFaUserSettingsStore yields null', async () => {
  const localSettings = ref<I_faUserSettings | null>(null)
  const programSettingsTree = ref<T_programSettingsRenderTree>({})

  await syncLocalProgramSettingsFromStore(
    () => null,
    localSettings,
    programSettingsTree
  )

  expect(localSettings.value).toBe(null)
  expect(Object.keys(programSettingsTree.value)).toHaveLength(0)
})
