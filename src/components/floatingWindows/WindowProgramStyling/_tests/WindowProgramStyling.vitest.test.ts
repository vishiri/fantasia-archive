import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import programStyling from 'app/i18n/en-US/floatingWindows/L_programStyling'

const windowProgramStylingFrameSpies = vi.hoisted(() => {
  return {
    onFramePointerDown: vi.fn(),
    onResizePointerDown: vi.fn(),
    onTitlePointerDown: vi.fn()
  }
})

vi.mock('app/src/scripts/floatingWindows/useFaFloatingWindowFrame', () => ({
  useFaFloatingWindowFrame: () => ({
    frameRef: ref(null),
    frameStyle: ref({}),
    onFramePointerDown: windowProgramStylingFrameSpies.onFramePointerDown,
    onResizePointerDown: windowProgramStylingFrameSpies.onResizePointerDown,
    onTitlePointerDown: windowProgramStylingFrameSpies.onTitlePointerDown,
    titleShortFrameClass: ref(undefined)
  })
}))

const windowProgramStylingMonacoState = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    isLoading: ref(false),
    loadError: ref<string | null>(null)
  }
})

vi.mock('app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingState', () => ({
  useWindowProgramStyling: () => ({
    closeWithoutSaving: vi.fn(),
    documentName: ref('WindowProgramStyling'),
    editorHostRef: ref(null),
    monaco: {
      isLoading: windowProgramStylingMonacoState.isLoading,
      loadError: windowProgramStylingMonacoState.loadError
    },
    saveAndCloseWindow: vi.fn(async () => undefined),
    windowModel: ref(true)
  })
}))

import WindowProgramStyling from '../WindowProgramStyling.vue'

beforeEach(() => {
  setActivePinia(createPinia())
  windowProgramStylingMonacoState.isLoading.value = false
  windowProgramStylingMonacoState.loadError.value = null
})

/**
 * WindowProgramStyling
 * Mounts with stubbed frame chrome and shows the title and primary actions from the production template.
 */
const programStylingT = (k: string): string => {
  if (k === 'floatingWindows.programStyling.title') {
    return programStyling.title
  }
  if (k === 'floatingWindows.programStyling.closeWithoutSaving') {
    return programStyling.closeWithoutSaving
  }
  if (k === 'floatingWindows.programStyling.saveButton') {
    return programStyling.saveButton
  }
  if (k === 'floatingWindows.programStyling.helpTooltip.aria') {
    return programStyling.helpTooltip.aria
  }
  if (k === 'floatingWindows.programStyling.loading') {
    return programStyling.loading
  }
  if (k === 'floatingWindows.programStyling.helpTooltip.title') {
    return programStyling.helpTooltip.title
  }
  if (k === 'floatingWindows.programStyling.helpTooltip.footer') {
    return programStyling.helpTooltip.footer
  }
  if (k.startsWith('floatingWindows.programStyling.helpTooltip.items.')) {
    const sub = k.replace('floatingWindows.programStyling.helpTooltip.items.', '')
    const items = programStyling.helpTooltip.items as Record<string, string>
    return items[sub] ?? k
  }
  return k
}

test('Test that WindowProgramStyling surfaces title and action button locators', () => {
  const w = mount(WindowProgramStyling, {
    global: {
      mocks: { $t: programStylingT },
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
        QSpinnerDots: { template: '<span />' },
        QTooltip: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(w.find('[data-test-locator="windowProgramStyling-title"]').text()).toContain(programStyling.title)
  expect(w.find('[data-test-locator="windowProgramStyling-button-close"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="windowProgramStyling-button-save"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="faFloatingWindowFrameResizeHandles"]').exists()).toBe(true)

  const helpBody = w.find('[data-test-locator="windowProgramStyling-helpTooltipBody"]')
  expect(helpBody.exists()).toBe(true)
  expect(helpBody.text()).toContain(programStyling.helpTooltip.title)
  expect(helpBody.text()).toContain(programStyling.helpTooltip.items.commandPalette)
  expect(helpBody.text()).toContain('F1')
  expect(helpBody.findAll('.windowProgramStyling__helpTooltipItem').length).toBeGreaterThan(0)

  w.unmount()
})

/**
 * WindowProgramStyling
 * Frame shell pointer targets should invoke the floating-window frame composable handlers.
 */
test('Test that WindowProgramStyling forwards frame and title-bar pointerdown to composable handlers', async () => {
  windowProgramStylingFrameSpies.onFramePointerDown.mockClear()
  windowProgramStylingFrameSpies.onTitlePointerDown.mockClear()

  const w = mount(WindowProgramStyling, {
    global: {
      mocks: { $t: programStylingT },
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
        QSpinnerDots: { template: '<span />' },
        QTooltip: { template: '<div><slot /></div>' }
      }
    }
  })

  await w.get('[data-test-locator="windowProgramStyling-frame"]').trigger('pointerdown')
  expect(windowProgramStylingFrameSpies.onFramePointerDown).toHaveBeenCalledTimes(1)

  await w.get('[data-test-locator="windowProgramStyling-dragHandle"]').trigger('pointerdown')
  expect(windowProgramStylingFrameSpies.onTitlePointerDown).toHaveBeenCalledTimes(1)

  w.unmount()
})

/**
 * WindowProgramStyling
 * Monaco bootstrap surfaces loading and load-error overlays from the shared monaco state object.
 */
test('Test that WindowProgramStyling shows loading and load-error overlays from monaco state', async () => {
  windowProgramStylingMonacoState.isLoading.value = true

  const wLoading = mount(WindowProgramStyling, {
    global: {
      mocks: { $t: programStylingT },
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
        QSpinnerDots: { template: '<span data-test-locator="stub-spinner-dots" />' },
        QTooltip: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(wLoading.find('[data-test-locator="windowProgramStyling-loadingOverlay"]').exists()).toBe(true)
  expect(wLoading.text()).toContain(programStyling.loading)
  wLoading.unmount()

  windowProgramStylingMonacoState.isLoading.value = false
  windowProgramStylingMonacoState.loadError.value = 'Monaco failed to load'

  const wError = mount(WindowProgramStyling, {
    global: {
      mocks: { $t: programStylingT },
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
        QSpinnerDots: { template: '<span />' },
        QTooltip: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(wError.find('[data-test-locator="windowProgramStyling-loadError"]').text()).toContain('Monaco failed to load')
  wError.unmount()
})
