/** @vitest-environment jsdom */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import { useDialogProjectSettings } from '../dialogProjectSettings_manager'

vi.mock('app/src/stores/scripts/sFaProjectSettingsBridge', () => ({
  faProjectSettingsFetchFreshForDialog: vi.fn()
}))

vi.mock('app/src/stores/scripts/sFaProjectWorldsBridge', () => ({
  faProjectWorldsFetchFreshForDialog: vi.fn()
}))

vi.mock('app/src/stores/scripts/sFaProjectDocumentTemplatesBridge', () => ({
  faProjectDocumentTemplatesFetchFreshForDialog: vi.fn()
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaActionAwait: vi.fn(async () => true)
}))

vi.mock('app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager', () => ({
  registerComponentDialogStackGuard: vi.fn()
}))

beforeEach(() => {
  setActivePinia(createPinia())
})

test('Test that manager save validation tooltip factory resolves i18n defaults', () => {
  const api = useDialogProjectSettings({})

  api.localSettings.value = {
    projectName: '',
    schemaVersion: 1
  }
  api.localDocumentTemplates.value = [
    {
      icon: 'mdi-file-document-outline',
      id: 'template-a',
      documentCount: 0,
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      worldAppendixTranslations: {}
    }
  ]
  api.localWorlds.value = [
    {
      color: '#808080',
      colorPallete: '',
      displayNameTranslations: {},
      documentCount: 0,
      id: 'world-a',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ]

  const tooltip = api.saveValidationErrorsTooltip.value
  expect(tooltip.bullets.length).toBeGreaterThan(0)
  expect(tooltip.intro).toBe('dialogs.projectSettings.saveErrors.tooltipIntro')
})
