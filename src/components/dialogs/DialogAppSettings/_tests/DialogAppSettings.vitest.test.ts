/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import type { PropType } from 'vue'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import DialogAppSettings from '../DialogAppSettings.vue'
import { APP_SETTINGS_OPTIONS } from '../_data/appSettingsOptions'
import { buildAppSettingsRenderTree } from '../scripts/functions/dialogAppSettingsTreeBuild'
import { i18n } from 'app/i18n/externalFileLoader'

const SEARCH_DEBOUNCE_MS = 300

/**
 * Vitest treats q-* tags as custom elements, so templates never bind Vue listeners on q-input.
 * Register a lightweight QInput stand-in and opt q-input out of isCustomElement so v-model debounce matches production.
 */
const dialogAppSettingsQInputStub = defineComponent({
  name: 'QInput',
  inheritAttrs: true,
  props: {
    debounce: {
      type: [String, Number],
      default: 0
    },
    modelValue: {
      type: [String, null] as PropType<string | null>,
      default: null
    }
  },
  emits: ['update:modelValue'],
  data (): { debounceTimer: ReturnType<typeof setTimeout> | undefined } {
    return {
      debounceTimer: undefined
    }
  },
  unmounted () {
    if (this.debounceTimer !== undefined) {
      clearTimeout(this.debounceTimer)
    }
  },
  methods: {
    onInput (event: Event) {
      const target = event.target as HTMLInputElement
      const raw = this.debounce
      const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : raw
      const wait = typeof parsed === 'number' && Number.isFinite(parsed) && parsed > 0 ? parsed : 0
      if (this.debounceTimer !== undefined) {
        clearTimeout(this.debounceTimer)
      }
      if (wait <= 0) {
        this.$emit('update:modelValue', target.value)
        return
      }
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = undefined
        this.$emit('update:modelValue', target.value)
      }, wait)
    }
  },
  template: `
    <div class="dialogAppSettings__settingsSearchInput-host">
      <slot name="prepend" />
      <input
        v-bind="$attrs"
        class="dialogAppSettings__settingsSearchInput"
        :value="modelValue ?? ''"
        @input="onInput"
      />
      <button
        type="button"
        class="dialogAppSettings__searchClearStub"
        @click="$emit('update:modelValue', null)"
      >
        clear
      </button>
    </div>
  `
})

const dialogAppSettingsQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'hide'],
  template: '<div class="dialogAppSettings-qdialog-stub" v-bind="$attrs"><slot /></div>'
})

const dialogAppSettingsQTabsStub = defineComponent({
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

const dialogAppSettingsQTabStub = defineComponent({
  name: 'QTab',
  inheritAttrs: true,
  template: '<div class="q-tab-stub" />'
})

const dialogAppSettingsQToggleStub = defineComponent({
  name: 'QToggle',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<button type="button" class="q-toggle-stub" @click="$emit(\'update:modelValue\', !modelValue)" />'
})

const dialogAppSettingsQTabPanelsStub = defineComponent({
  name: 'QTabPanels',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  template: '<div class="q-tab-panels-stub"><slot /></div>'
})

const dialogAppSettingsQTabPanelStub = defineComponent({
  name: 'QTabPanel',
  inheritAttrs: true,
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  template: '<div class="q-tab-panel-stub"><slot /></div>'
})

const dialogAppSettingsQIconStub = defineComponent({
  name: 'QIcon',
  inheritAttrs: true,
  template: '<i class="q-icon-stub" />'
})

const appSettingsQuasarStubTags = new Set([
  'q-btn',
  'q-card',
  'q-card-actions',
  'q-card-section',
  'q-dialog',
  'q-icon',
  'q-input',
  'q-separator',
  'q-tab',
  'q-tab-panel',
  'q-tab-panels',
  'q-tabs',
  'q-toggle',
  'q-tooltip'
])

const appSettingsDialogMountOptions = {
  global: {
    components: {
      QDialog: dialogAppSettingsQDialogStub,
      QIcon: dialogAppSettingsQIconStub,
      QInput: dialogAppSettingsQInputStub,
      QTab: dialogAppSettingsQTabStub,
      QTabPanel: dialogAppSettingsQTabPanelStub,
      QTabPanels: dialogAppSettingsQTabPanelsStub,
      QTabs: dialogAppSettingsQTabsStub,
      QToggle: dialogAppSettingsQToggleStub
    },
    config: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => {
          if (appSettingsQuasarStubTags.has(tag.toLowerCase())) {
            return false
          }

          return /^q-/i.test(tag)
        }
      }
    },
    mocks: { $t: (k: string) => k }
  }
} as const

/**
 * DialogAppSettings
 * directInput should open the app settings dialog shell for AppSettings input.
 */
test('Test that DialogAppSettings renders dialog shell for AppSettings input', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  const html = w.html()
  expect(html).toContain('dialogComponent')
  expect(html).toContain('AppSettings')
  expect(w.text()).toContain('dialogs.appSettings.title')
  w.unmount()
})

/**
 * DialogAppSettings
 * directSettingsSnapshot should hydrate the tree without calling the user-settings bridge.
 */
test('Test that DialogAppSettings hydrates from directSettingsSnapshot without faUserSettings.getSettings', async () => {
  const getSettings = vi.fn(async () => ({ ...FA_USER_SETTINGS_DEFAULTS }))

  window.faContentBridgeAPIs.faUserSettings = {
    getSettings,
    setSettings: vi.fn(async () => undefined)
  }

  const w = mount(DialogAppSettings, {
    props: {
      directInput: 'AppSettings',
      directSettingsSnapshot: {
        ...FA_USER_SETTINGS_DEFAULTS,
        darkMode: true
      }
    },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  expect(getSettings).not.toHaveBeenCalled()
  expect(w.find('[data-test-setting-id="darkMode"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogAppSettings
 * A non-empty trimmed search query should surface the full-width search panel and dialog modifier class.
 */
test('Test that DialogAppSettings shows search overlay panel after debounced non-empty query', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogAppSettings__settingsSearchInput').setValue('dark')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  expect(w.get('.dialogComponent').classes()).toContain('hasActiveSearchQuery')
  expect(w.find('[data-test-locator="dialogAppSettings-searchAllSettingsPanel"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogAppSettings
 * Whitespace-only search should not count as active; overlay and search panel stay absent.
 */
test('Test that DialogAppSettings ignores whitespace-only settings search after debounce', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogAppSettings__settingsSearchInput').setValue('   ')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  expect(w.get('.dialogComponent').classes()).not.toContain('hasActiveSearchQuery')
  expect(w.find('[data-test-locator="dialogAppSettings-searchAllSettingsPanel"]').exists()).toBe(false)
  w.unmount()
})

/**
 * DialogAppSettings
 * No matching settings should show the empty-state card with the reading mascot still mounted but visible only in that state.
 */
test('Test that DialogAppSettings shows reading mascot empty state when search matches nothing', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogAppSettings__settingsSearchInput').setValue(
    'zzzzzzzz-no-app-settings-match-zzzz'
  )
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  const empty = w.get('[data-test-locator="dialogAppSettings-searchNoResults"]')
  expect(empty.isVisible()).toBe(true)
  const mascot = w.get('[data-test-locator="fantasiaMascotImage-image"]')
  expect(mascot.attributes('data-test-image')).toBe('reading')
  w.unmount()
})

/**
 * DialogAppSettings
 * With matches, the empty-state layer stays in the DOM for image reuse but must not be visible.
 */
test('Test that DialogAppSettings hides empty state visually when search returns matches', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogAppSettings__settingsSearchInput').setValue('dark')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  const empty = w.get('[data-test-locator="dialogAppSettings-searchNoResults"]')
  expect((empty.element as HTMLElement).style.display).toBe('none')
  w.unmount()
})

/**
 * DialogAppSettings
 * Clearing the settings search should emit a null query from the debounced input stand-in.
 */
test('Test that DialogAppSettings clears settings search to null via stub clear control', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogAppSettings__settingsSearchInput').setValue('dark')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  await w.get('.dialogAppSettings__searchClearStub').trigger('click')
  await flushPromises()

  expect(w.get('.dialogComponent').classes()).not.toContain('hasActiveSearchQuery')
  w.unmount()
})

/**
 * DialogAppSettings
 * Vertical tabs should accept category selection updates from the QTabs stand-in.
 */
test('Test that DialogAppSettings updates selected category tab from QTabs emit', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  const keys = Object.keys(buildAppSettingsRenderTree(
    {
      t: (key: string) => i18n.global.t(key),
      te: (key: string) => i18n.global.te(key)
    },
    APP_SETTINGS_OPTIONS,
    { ...FA_USER_SETTINGS_DEFAULTS }
  ))
  const nextTab = keys.length > 1 ? keys[1]! : keys[0]
  const tabs = w.findComponent({ name: 'QTabs' })
  await tabs.vm.$emit('update:modelValue', nextTab)
  await flushPromises()

  expect(tabs.props('modelValue')).toBe(nextTab)
  w.unmount()
})

/**
 * DialogAppSettings
 * Toggling a setting should route update-setting through the panels column wiring.
 */
test('Test that DialogAppSettings toggles a setting via QToggle stand-in', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  const toggles = w.findAllComponents({ name: 'QToggle' })
  expect(toggles.length).toBeGreaterThan(0)
  await toggles[0]!.trigger('click')
  await flushPromises()

  w.unmount()
})

/**
 * DialogAppSettings
 * Search hits spanning multiple top-level categories should render the inter-category separator in the search overlay.
 */
test('Test that DialogAppSettings search overlay lists multiple categories for broad needles', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  await w.get('input.dialogAppSettings__settingsSearchInput').setValue('hide')
  await flushPromises()
  await new Promise((resolve) => {
    setTimeout(resolve, SEARCH_DEBOUNCE_MS)
  })
  await flushPromises()

  const searchCategoryPanels = w.findAll('[data-test-locator^="dialogAppSettings-search-category-"]')
  expect(searchCategoryPanels.length).toBeGreaterThanOrEqual(2)

  const searchPanel = w.get('[data-test-locator="dialogAppSettings-searchAllSettingsPanel"]')
  const searchToggle = searchPanel.find('.q-toggle-stub')
  expect(searchToggle.exists()).toBe(true)
  await searchToggle.trigger('click')
  await flushPromises()

  w.unmount()
})

/**
 * DialogAppSettings
 * Root q-dialog should accept v-model updates from the dialog shell.
 */
test('Test that DialogAppSettings forwards q-dialog v-model updates', async () => {
  const w = mount(DialogAppSettings, {
    props: { directInput: 'AppSettings' },
    ...appSettingsDialogMountOptions
  })

  await flushPromises()

  const dlg = w.findComponent({ name: 'QDialog' })
  await dlg.vm.$emit('update:modelValue', false)
  await flushPromises()

  w.unmount()
})
