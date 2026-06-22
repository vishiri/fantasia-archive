/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import DialogProjectSettings from '../DialogProjectSettings.vue'
import { mergeDialogProjectSettingsVitestGlobal } from 'app/helpers/dialogProjectSettingsVitestI18n'

vi.mock('app/src/stores/scripts/sFaProjectSettingsBridge', () => ({
  faProjectSettingsFetchFreshForDialog: vi.fn(async () => ({
    projectName: 'Vitest Project',
    schemaVersion: 1 as const
  }))
}))

vi.mock('app/src/stores/scripts/sFaProjectWorldsBridge', () => ({
  faProjectWorldsFetchFreshForDialog: vi.fn(async () => ([
    {
      color: '#808080',
      colorPallete: '',
      displayNameTranslations: { 'en-US': 'Stub' },
      documentCount: 0,
      id: '550e8400-e29b-41d4-a716-446655440000',
      templateLayout: {
        groups: [],
        placements: []
      }
    }
  ]))
}))

vi.mock('app/src/stores/scripts/sFaProjectDocumentTemplatesBridge', () => ({
  faProjectDocumentTemplatesFetchFreshForDialog: vi.fn(async () => ([]))
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaActionAwait: vi.fn(async () => true)
}))

const dialogProjectSettingsQDialogStub = defineComponent({
  name: 'QDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<div class="q-dialog-stub"><slot v-if="modelValue" /></div>'
})

const dialogProjectSettingsQInputStub = defineComponent({
  name: 'QInput',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    onInput (e: Event): void {
      const v = (e.target as HTMLInputElement).value
      this.$emit('update:modelValue', v)
    }
  },
  template: `
    <input
      class="dialog-project-settings-qinput-mock"
      :value="modelValue"
      v-bind="$attrs"
      @input="onInput"
    />
  `
})

const dialogProjectSettingsQBtnStub = defineComponent({
  name: 'QBtn',
  inheritAttrs: true,
  props: {
    disable: {
      type: Boolean,
      default: false
    }
  },
  template: '<button type="button" v-bind="$attrs" :disabled="disable" @click="$emit(\'click\')"><slot /></button>'
})

const dialogProjectSettingsQIconStub = defineComponent({
  name: 'QIcon',
  inheritAttrs: true,
  template: '<span class="q-icon-stub" v-bind="$attrs"><slot /></span>'
})

const dialogProjectSettingsQTooltipStub = defineComponent({
  name: 'QTooltip',
  template: '<span class="q-tooltip-stub"><slot /></span>'
})

const dialogProjectSettingsQTabsStub = defineComponent({
  name: 'QTabs',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  template: '<div class="q-tabs-stub"><slot /></div>'
})

const dialogProjectSettingsQTabStub = defineComponent({
  name: 'QTab',
  inheritAttrs: true,
  template: '<div class="q-tab-stub" />'
})

const dialogProjectSettingsStubs = {
  FaLocaleTranslationsInput: defineComponent({
    name: 'FaLocaleTranslationsInput',
    props: {
      modelValue: {
        type: Object,
        required: true
      }
    },
    emits: ['update:modelValue'],
    template: '<div class="fa-locale-translations-input-stub" />'
  }),
  QBtn: dialogProjectSettingsQBtnStub,
  QCard: defineComponent({
    name: 'QCard',
    template: '<div class="q-card-stub"><slot /></div>'
  }),
  QCardActions: defineComponent({
    name: 'QCardActions',
    template: '<div class="q-card-actions-stub"><slot /></div>'
  }),
  QCardSection: defineComponent({
    name: 'QCardSection',
    template: '<div class="q-card-section-stub"><slot /></div>'
  }),
  QDialog: dialogProjectSettingsQDialogStub,
  QIcon: dialogProjectSettingsQIconStub,
  QInput: dialogProjectSettingsQInputStub,
  QTab: dialogProjectSettingsQTabStub,
  QTabs: dialogProjectSettingsQTabsStub,
  QTooltip: dialogProjectSettingsQTooltipStub
}

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * DialogProjectSettings
 * Mount smoke: direct open shows title and project name field with hydrated snapshot.
 */
test('Test that DialogProjectSettings mounts with direct snapshot and shows project name field', async () => {
  const w = mount(DialogProjectSettings, {
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: dialogProjectSettingsStubs
    }),
    props: {
      directInput: 'ProjectSettings',
      directSettingsSnapshot: {
        projectName: 'Snapshot Name',
        schemaVersion: 1
      }
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProjectSettings-title"]').text()).toContain(
    'dialogs.projectSettings.title'
  )
  const nameInput = w.find('[data-test-locator="dialogProjectSettings-input-projectName"]')
  expect(nameInput.exists()).toBe(true)
  expect((nameInput.element as HTMLInputElement).value).toBe('Snapshot Name')
})

/**
 * DialogProjectSettings
 * Save dispatches saveProjectSettings and closes the dialog on success.
 */
test('Test that DialogProjectSettings save button persists and closes the dialog', async () => {
  const runFaActionAwait = vi.mocked(
    (await import('app/src/scripts/actionManager/faActionManagerRun_manager')).runFaActionAwait
  )

  const w = mount(DialogProjectSettings, {
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: dialogProjectSettingsStubs
    }),
    props: {
      directInput: 'ProjectSettings',
      directSettingsSnapshot: {
        projectName: 'Snapshot Name',
        schemaVersion: 1
      }
    }
  })

  await flushPromises()

  await w.find('[data-test-locator="dialogProjectSettings-button-save"]').trigger('click')
  await flushPromises()

  expect(runFaActionAwait).toHaveBeenCalledWith('saveProjectSettings', {
    documentTemplates: [],
    settings: {
      projectName: 'Snapshot Name'
    },
    worlds: [
      {
        color: '#808080',
        displayNameTranslations: { 'en-US': 'Stub' },
        id: '550e8400-e29b-41d4-a716-446655440000',
        templateLayout: {
          groups: [],
          placements: []
        }
      }
    ]
  })
})

/**
 * DialogProjectSettings
 * Editing the project name updates the local draft used for save.
 */
test('Test that DialogProjectSettings updates the local project name draft', async () => {
  const w = mount(DialogProjectSettings, {
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: dialogProjectSettingsStubs
    }),
    props: {
      directInput: 'ProjectSettings',
      directSettingsSnapshot: {
        projectName: 'Before',
        schemaVersion: 1
      }
    }
  })

  await flushPromises()

  const nameInput = w.find('[data-test-locator="dialogProjectSettings-input-projectName"]')
  await nameInput.setValue('After')

  expect((nameInput.element as HTMLInputElement).value).toBe('After')
  expect(w.find('[data-test-locator="dialogProjectSettings-button-save"]').attributes('disabled')).toBeUndefined()
})

/**
 * DialogProjectSettings
 * Hides the panels column until local settings hydrate from SQLite or direct snapshot.
 */
test('Test that DialogProjectSettings hides panels before local settings hydrate', async () => {
  const { faProjectSettingsFetchFreshForDialog } = await import(
    'app/src/stores/scripts/sFaProjectSettingsBridge'
  )
  let resolveFetch: ((value: { projectName: string, schemaVersion: 1 }) => void) | undefined
  vi.mocked(faProjectSettingsFetchFreshForDialog).mockImplementationOnce(async () => {
    return await new Promise((resolve) => {
      resolveFetch = resolve
    })
  })

  const w = mount(DialogProjectSettings, {
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: dialogProjectSettingsStubs
    }),
    props: {
      directInput: 'ProjectSettings'
    }
  })

  expect(w.find('.dialogProjectSettings__tabPanelsHost').exists()).toBe(false)

  resolveFetch?.({
    projectName: 'Late load',
    schemaVersion: 1
  })
  await flushPromises()

  expect(w.find('[data-test-locator="dialogProjectSettings-input-projectName"]').exists()).toBe(true)
})

/**
 * DialogProjectSettings
 * Disables save when the trimmed project name is empty.
 */
test('Test that DialogProjectSettings disables save for whitespace-only names', async () => {
  const w = mount(DialogProjectSettings, {
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: dialogProjectSettingsStubs
    }),
    props: {
      directInput: 'ProjectSettings',
      directSettingsSnapshot: {
        projectName: '   ',
        schemaVersion: 1
      }
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProjectSettings-button-save"]').attributes('disabled')).toBeDefined()
})

/**
 * DialogProjectSettings
 * Shows a negative save-errors icon with a multiline tooltip when save is blocked.
 */
test('Test that DialogProjectSettings shows save validation errors icon beside Save settings', async () => {
  const w = mount(DialogProjectSettings, {
    global: mergeDialogProjectSettingsVitestGlobal({
      stubs: dialogProjectSettingsStubs
    }),
    props: {
      directInput: 'ProjectSettings',
      directSettingsSnapshot: {
        projectName: '   ',
        schemaVersion: 1
      }
    }
  })

  await flushPromises()

  const icon = w.find('[data-test-locator="dialogProjectSettings-saveErrorsIcon"]')
  expect(icon.exists()).toBe(true)
  const tooltipText = icon.attributes('data-test-tooltip-text') ?? ''
  expect(tooltipText).toContain('dialogs.projectSettings.saveErrors.tooltipIntro')
  expect(tooltipText).toContain('dialogs.projectSettings.fields.projectName.errorRequired')
  expect(tooltipText.indexOf('\n- ')).toBeGreaterThan(-1)
})
