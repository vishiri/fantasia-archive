/* eslint-disable vue/one-component-per-file -- Quasar stand-ins for jsdom mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import GlobalLanguageSelector from '../GlobalLanguageSelector.vue'

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

const qMenuStubTags = new Set([
  'q-avatar',
  'q-btn',
  'q-item',
  'q-item-section',
  'q-list',
  'q-menu',
  'q-separator',
  'q-tooltip'
])

const globalLanguageSelectorCompilerOpts = {
  isCustomElement: (tag: string): boolean => {
    const lower = tag.toLowerCase()
    if (qMenuStubTags.has(lower)) {
      return false
    }

    return /^q-/i.test(tag)
  }
}

const QBtnStub = defineComponent({
  name: 'QBtn',
  inheritAttrs: true,
  emits: ['click'],
  template: `
    <button type="button" v-bind="$attrs" @click.capture="$emit('click', $event)">
      <slot />
    </button>
  `
})

const QMenuStub = defineComponent({
  name: 'QMenu',
  mounted () {
    this.$emit('show')
  },
  unmounted () {
    this.$emit('hide')
  },
  template: '<div class="globalLanguageSelector-qmenu-stub"><slot /></div>'
})

const QListStub = defineComponent({
  name: 'QList',
  inheritAttrs: true,
  template: '<div class="q-list-stub"><slot /></div>'
})

const QItemStub = defineComponent({
  name: 'QItem',
  inheritAttrs: true,
  emits: ['click'],
  template: '<div class="q-item-stub" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></div>'
})

const QItemSectionStub = defineComponent({
  name: 'QItemSection',
  inheritAttrs: true,
  template: '<div class="q-item-section-stub"><slot /></div>'
})

const QAvatarStub = defineComponent({
  name: 'QAvatar',
  inheritAttrs: true,
  template: '<div class="q-avatar-stub"><slot /></div>'
})

const QSeparatorStub = defineComponent({
  name: 'QSeparator',
  template: '<hr class="q-separator-stub" />'
})

const QTooltipStub = defineComponent({
  name: 'QTooltip',
  inheritAttrs: true,
  setup (_props, { slots }) {
    return () => slots.default?.() ?? null
  }
})

const globalLanguageSelectorQuasarStubs = {
  QAvatar: QAvatarStub,
  QBtn: QBtnStub,
  QItem: QItemStub,
  QItemSection: QItemSectionStub,
  QList: QListStub,
  QMenu: QMenuStub,
  QSeparator: QSeparatorStub,
  QTooltip: QTooltipStub
} as const

const globalLanguageSelectorSpellcheckStub = defineComponent({
  name: 'GlobalLanguageSelectorSpellcheckRefreshControl',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['refreshWebContents'],
  template: '<div data-test-locator="spellcheck-stub-root" v-if="show" />'
})

/**
 * GlobalLanguageSelector
 * Hidden when MODE is not electron even if the user-settings bridge exists.
 */
test('Test that GlobalLanguageSelector does not render when MODE is not electron', () => {
  vi.stubEnv('MODE', 'spa')
  setActivePinia(createPinia())
  const w = mount(GlobalLanguageSelector, {
    global: {
      config: { compilerOptions: globalLanguageSelectorCompilerOpts },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('.globalLanguageSelector').exists()).toBe(false)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalLanguageSelector
 * Hidden in electron MODE when the user-settings bridge is absent.
 */
test('Test that GlobalLanguageSelector does not render when faUserSettings bridge is missing', () => {
  vi.stubEnv('MODE', 'electron')
  setActivePinia(createPinia())
  const prev = window.faContentBridgeAPIs.faUserSettings
  delete (window.faContentBridgeAPIs as { faUserSettings?: unknown }).faUserSettings

  const w = mount(GlobalLanguageSelector, {
    global: {
      config: { compilerOptions: globalLanguageSelectorCompilerOpts },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="globalLanguageSelector-root"]').exists()).toBe(false)

  window.faContentBridgeAPIs.faUserSettings = prev
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalLanguageSelector
 * Renders the trigger in electron MODE with user-settings bridge present.
 */
test('Test that GlobalLanguageSelector exposes the menu trigger in electron mode', async () => {
  vi.stubEnv('MODE', 'electron')
  setActivePinia(createPinia())
  const store = S_FaUserSettings()
  await store.refreshSettings()

  const w = mount(GlobalLanguageSelector, {
    global: {
      components: {
        ...globalLanguageSelectorQuasarStubs,
        GlobalLanguageSelectorSpellcheckRefreshControl: globalLanguageSelectorSpellcheckStub
      },
      config: { compilerOptions: globalLanguageSelectorCompilerOpts },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(w.find('[data-test-locator="globalLanguageSelector-trigger"]').exists()).toBe(true)
  w.unmount()
  vi.unstubAllEnvs()
})

/**
 * GlobalLanguageSelector
 * Trigger capture click, menu show or hide hooks, and language pick should run without throwing.
 */
test('Test that GlobalLanguageSelector handles trigger click and language selection', async () => {
  vi.stubEnv('MODE', 'electron')
  let stored: I_faUserSettings = { ...FA_USER_SETTINGS_DEFAULTS }
  window.faContentBridgeAPIs.faUserSettings = {
    getSettings: vi.fn(async () => ({ ...stored })),
    setSettings: vi.fn(async (patch: Partial<I_faUserSettings>) => {
      stored = {
        ...stored,
        ...patch
      }
    })
  }

  setActivePinia(createPinia())
  const store = S_FaUserSettings()
  await store.refreshSettings()

  const w = mount(GlobalLanguageSelector, {
    attachTo: document.body,
    global: {
      components: {
        ...globalLanguageSelectorQuasarStubs,
        GlobalLanguageSelectorSpellcheckRefreshControl: globalLanguageSelectorSpellcheckStub
      },
      config: { compilerOptions: globalLanguageSelectorCompilerOpts },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  await flushPromises()

  await w.get('[data-test-locator="globalLanguageSelector-trigger"]').trigger('click')
  await flushPromises()

  const fr = document.body.querySelector('[data-test-locator="globalLanguageSelector-option-fr"]')
  expect(fr).not.toBeNull()
  ;(fr as HTMLElement).click()
  await flushPromises()

  expect(store.settings?.languageCode).toBe('fr')

  w.unmount()
  vi.unstubAllEnvs()
})
