import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, ref } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import appStyling from 'app/i18n/en-US/floatingWindows/L_appStyling'

const windowAppStylingFrameSpies = vi.hoisted(() => {
  return {
    onFramePointerDown: vi.fn(),
    onResizePointerDown: vi.fn(),
    onTitlePointerDown: vi.fn()
  }
})

vi.mock('app/src/scripts/floatingWindows/floatingWindows_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/floatingWindows/floatingWindows_manager')>()
  return {
    ...actual,
    useFaFloatingWindowFrame: () => ({
      frameRef: ref(null),
      frameStyle: ref({}),
      onFramePointerDown: windowAppStylingFrameSpies.onFramePointerDown,
      onResizePointerDown: windowAppStylingFrameSpies.onResizePointerDown,
      onTitlePointerDown: windowAppStylingFrameSpies.onTitlePointerDown,
      titleShortFrameClass: ref(undefined)
    })
  }
})

const windowAppStylingMonacoState = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    isLoading: ref(false),
    loadError: ref<string | null>(null)
  }
})

const windowAppStylingHelpState = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  const helpKeybindMenuOpen = ref(false)
  let helpMenuHoverTimer: ReturnType<typeof setTimeout> | undefined
  return {
    helpKeybindMenuOpen,
    onHelpIconMouseEnter: (): void => {
      if (helpMenuHoverTimer !== undefined) {
        clearTimeout(helpMenuHoverTimer)
      }
      helpMenuHoverTimer = setTimeout(() => {
        helpMenuHoverTimer = undefined
        helpKeybindMenuOpen.value = true
      }, 500)
    },
    onHelpIconMouseLeave: (): void => {
      if (helpMenuHoverTimer !== undefined) {
        clearTimeout(helpMenuHoverTimer)
        helpMenuHoverTimer = undefined
      }
    }
  }
})

vi.mock('app/src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager', () => ({
  useWindowAppStylingSurface: () => ({
    closeWithoutSaving: vi.fn(),
    documentName: ref('WindowAppStyling'),
    editorHostRef: ref(null),
    monaco: {
      isLoading: windowAppStylingMonacoState.isLoading,
      loadError: windowAppStylingMonacoState.loadError
    },
    saveAndCloseWindow: vi.fn(async () => undefined),
    windowModel: ref(true),
    FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: {},
    FA_FLOATING_WINDOW_POP_TRANSITION_MS: 300,
    buildFaColorVarSwatchStyle: () => ({ backgroundColor: 'var(--fa-color-primary)' }),
    faThemeCustomPropertyNames: ref(['--fa-color-accent']),
    frameStyleWithDialogTransition: ref({}),
    helpKeybindMenuOpen: windowAppStylingHelpState.helpKeybindMenuOpen,
    monacoKeybindHelpItems: ref([
      {
        labelKey: 'commandPalette',
        chord: 'F1'
      }
    ]),
    onHelpIconMouseEnter: windowAppStylingHelpState.onHelpIconMouseEnter,
    onHelpIconMouseLeave: windowAppStylingHelpState.onHelpIconMouseLeave,
    frameRef: ref(null),
    onFramePointerDown: windowAppStylingFrameSpies.onFramePointerDown,
    onResizePointerDown: windowAppStylingFrameSpies.onResizePointerDown,
    onTitlePointerDown: windowAppStylingFrameSpies.onTitlePointerDown,
    titleShortFrameClass: ref(undefined)
  })
}))

import WindowAppStyling from '../WindowAppStyling.vue'

const injectMinimalFaRootVarsForList = (): void => {
  const s = document.createElement('style')
  s.setAttribute('data-fa-vitest-theme-stub', '1')
  s.append(
    document.createTextNode(
      [
        ':root {',
        '  --fa-color-accent: 0;',
        '  --fa-color-primary: 0;',
        '  --fa-color-tooltip-background: 0;',
        '}'
      ].join(' ')
    )
  )
  document.head.append(s)
}

beforeEach(() => {
  setActivePinia(createPinia())
  windowAppStylingMonacoState.isLoading.value = false
  windowAppStylingMonacoState.loadError.value = null
  injectMinimalFaRootVarsForList()
})

afterEach(() => {
  for (const el of document.querySelectorAll('style[data-fa-vitest-theme-stub="1"]')) {
    el.remove()
  }
})

/**
 * WindowAppStyling
 * Mounts with stubbed frame chrome and shows the title and primary actions from the production template.
 */
const appStylingT = (k: string): string => {
  if (k === 'floatingWindows.appStyling.title') {
    return appStyling.title
  }
  if (k === 'floatingWindows.appStyling.closeWithoutSaving') {
    return appStyling.closeWithoutSaving
  }
  if (k === 'floatingWindows.appStyling.saveButton') {
    return appStyling.saveButton
  }
  if (k === 'floatingWindows.appStyling.helpTooltip.aria') {
    return appStyling.helpTooltip.aria
  }
  if (k === 'floatingWindows.appStyling.loading') {
    return appStyling.loading
  }
  if (k === 'floatingWindows.appStyling.helpTooltip.title') {
    return appStyling.helpTooltip.title
  }
  if (k === 'floatingWindows.appStyling.helpTooltip.variableListTitle') {
    return appStyling.helpTooltip.variableListTitle
  }
  if (k === 'floatingWindows.appStyling.helpTooltip.footer') {
    return appStyling.helpTooltip.footer
  }
  if (k.startsWith('floatingWindows.appStyling.helpTooltip.items.')) {
    const sub = k.replace('floatingWindows.appStyling.helpTooltip.items.', '')
    const items = appStyling.helpTooltip.items as Record<string, string>
    return items[sub] ?? k
  }
  return k
}

test('Test that WindowAppStyling surfaces title and action button locators', () => {
  const w = mount(WindowAppStyling, {
    global: {
      mocks: { $t: appStylingT },
      stubs: {
        FaFloatingWindowBodyTeleport: {
          template: '<div><slot /></div>'
        },
        QBtn: {
          inheritAttrs: true,
          props: {
            label: {
              default: '',
              type: String
            }
          },
          template: '<button type="button" v-bind="$attrs"><span>{{ label }}</span></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QCardSection: { template: '<div><slot /></div>' },
        QIcon: { template: '<i><slot /></i>' },
        QMenu: { template: '<div class="q-menu-stub"><slot /></div>' },
        QSpinnerDots: { template: '<span />' }
      }
    }
  })

  expect(w.find('[data-test-locator="windowAppStyling-title"]').text()).toContain(appStyling.title)
  expect(w.find('[data-test-locator="windowAppStyling-button-close"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="windowAppStyling-button-save"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="faFloatingWindowFrameResizeHandles"]').exists()).toBe(true)

  const helpBody = w.find('[data-test-locator="windowAppStyling-helpTooltipBody"]')
  expect(helpBody.exists()).toBe(true)
  expect(helpBody.text()).toContain(appStyling.helpTooltip.title)
  expect(helpBody.text()).toContain(appStyling.helpTooltip.items.commandPalette)
  expect(helpBody.text()).toContain('F1')
  expect(helpBody.findAll('.windowAppStyling__helpTooltipItem').length).toBeGreaterThan(0)
  expect(helpBody.find('[data-test-locator="windowAppStyling-faThemeVarList"]').exists()).toBe(true)
  expect(helpBody.findAll('.windowAppStyling__helpTooltipFaVarItem').length).toBeGreaterThan(0)
  expect(helpBody.findAll('.windowAppStyling__helpTooltipFaVarSwatch').length).toBe(
    helpBody.findAll('.windowAppStyling__helpTooltipFaVarItem').length
  )
  expect(helpBody.text()).toContain('--fa-color-accent')

  w.unmount()
})

/**
 * WindowAppStyling
 * Frame shell pointer targets should invoke the floating-window frame composable handlers.
 */
test('Test that WindowAppStyling forwards frame and title-bar pointerdown to composable handlers', async () => {
  windowAppStylingFrameSpies.onFramePointerDown.mockClear()
  windowAppStylingFrameSpies.onTitlePointerDown.mockClear()

  const w = mount(WindowAppStyling, {
    global: {
      mocks: { $t: appStylingT },
      stubs: {
        FaFloatingWindowBodyTeleport: {
          template: '<div><slot /></div>'
        },
        QBtn: {
          inheritAttrs: true,
          props: {
            label: {
              default: '',
              type: String
            }
          },
          template: '<button type="button" v-bind="$attrs"><span>{{ label }}</span></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QCardSection: { template: '<div><slot /></div>' },
        QIcon: { template: '<i><slot /></i>' },
        QMenu: { template: '<div class="q-menu-stub"><slot /></div>' },
        QSpinnerDots: { template: '<span />' }
      }
    }
  })

  await w.get('[data-test-locator="windowAppStyling-frame"]').trigger('pointerdown')
  expect(windowAppStylingFrameSpies.onFramePointerDown).toHaveBeenCalledTimes(1)

  await w.get('[data-test-locator="windowAppStyling-dragHandle"]').trigger('pointerdown')
  expect(windowAppStylingFrameSpies.onTitlePointerDown).toHaveBeenCalledTimes(1)

  w.unmount()
})

/**
 * WindowAppStyling
 * Monaco bootstrap surfaces loading and load-error overlays from the shared monaco state object.
 */
test('Test that WindowAppStyling shows loading and load-error overlays from monaco state', async () => {
  windowAppStylingMonacoState.isLoading.value = true

  const wLoading = mount(WindowAppStyling, {
    global: {
      mocks: { $t: appStylingT },
      stubs: {
        FaFloatingWindowBodyTeleport: {
          template: '<div><slot /></div>'
        },
        QBtn: {
          inheritAttrs: true,
          props: {
            label: {
              default: '',
              type: String
            }
          },
          template: '<button type="button" v-bind="$attrs"><span>{{ label }}</span></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QCardSection: { template: '<div><slot /></div>' },
        QIcon: { template: '<i><slot /></i>' },
        QMenu: { template: '<div class="q-menu-stub"><slot /></div>' },
        QSpinnerDots: { template: '<span data-test-locator="stub-spinner-dots" />' }
      }
    }
  })

  expect(wLoading.find('[data-test-locator="windowAppStyling-loadingOverlay"]').exists()).toBe(true)
  expect(wLoading.text()).toContain(appStyling.loading)
  wLoading.unmount()

  windowAppStylingMonacoState.isLoading.value = false
  windowAppStylingMonacoState.loadError.value = 'Monaco failed to load'

  const wError = mount(WindowAppStyling, {
    global: {
      mocks: { $t: appStylingT },
      stubs: {
        FaFloatingWindowBodyTeleport: {
          template: '<div><slot /></div>'
        },
        QBtn: {
          inheritAttrs: true,
          props: {
            label: {
              default: '',
              type: String
            }
          },
          template: '<button type="button" v-bind="$attrs"><span>{{ label }}</span></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QCardSection: { template: '<div><slot /></div>' },
        QIcon: { template: '<i><slot /></i>' },
        QMenu: { template: '<div class="q-menu-stub"><slot /></div>' },
        QSpinnerDots: { template: '<span />' }
      }
    }
  })

  expect(wError.find('[data-test-locator="windowAppStyling-loadError"]').text()).toContain('Monaco failed to load')
  wError.unmount()
})

/**
 * WindowAppStyling
 * Help icon hover opens the menu after the delay, the q-menu v-model handler runs, and the help watch refreshes theme names.
 */
test('Test that WindowAppStyling help menu opens after hover delay and closes via q-menu v-model', async () => {
  vi.useFakeTimers()
  const qMenuStub = defineComponent({
    name: 'QMenu',
    inheritAttrs: true,
    props: {
      modelValue: {
        default: false,
        type: Boolean
      }
    },
    emits: ['update:modelValue'],
    template: `
      <div class="window-app-styling-q-menu-stub" data-test-locator="windowAppStyling-helpMenu" v-bind="$attrs">
        <slot />
        <button
          type="button"
          class="window-app-styling-q-menu-close"
          @click="$emit('update:modelValue', false)"
        />
      </div>
    `
  })

  const w = mount(WindowAppStyling, {
    global: {
      components: { QMenu: qMenuStub },
      mocks: { $t: appStylingT },
      stubs: {
        FaFloatingWindowBodyTeleport: {
          template: '<div><slot /></div>'
        },
        QBtn: {
          inheritAttrs: true,
          props: {
            label: {
              default: '',
              type: String
            }
          },
          template: '<button type="button" v-bind="$attrs"><span>{{ label }}</span></button>'
        },
        QCard: { template: '<div><slot /></div>' },
        QCardActions: { template: '<div><slot /></div>' },
        QCardSection: { template: '<div><slot /></div>' },
        QIcon: {
          inheritAttrs: true,
          template: '<span><slot /></span>'
        },
        QSeparator: { template: '<div />' },
        QSpinnerDots: { template: '<span />' }
      }
    }
  })

  await w.get('[data-test-locator="windowAppStyling-helpIcon"]').trigger('mouseenter')
  await vi.advanceTimersByTimeAsync(500)
  await vi.runAllTimersAsync()

  const menu = w.findComponent({ name: 'QMenu' })
  expect(menu.props('modelValue')).toBe(true)

  await menu.find('.window-app-styling-q-menu-close').trigger('click')
  expect(menu.emitted('update:modelValue')?.some((row) => row[0]! === false)).toBe(true)

  w.unmount()
  vi.useRealTimers()
})
