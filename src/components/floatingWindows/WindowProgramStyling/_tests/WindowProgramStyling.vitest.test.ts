import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import programStyling from 'app/i18n/en-US/floatingWindows/L_programStyling'

vi.mock('app/src/scripts/floatingWindows/useFaFloatingWindowFrame', () => ({
  useFaFloatingWindowFrame: () => ({
    frameRef: ref(null),
    frameStyle: ref({}),
    onFramePointerDown: vi.fn(),
    onResizePointerDown: vi.fn(),
    onTitlePointerDown: vi.fn(),
    titleShortFrameClass: ref(undefined)
  })
}))

vi.mock('app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingState', () => ({
  useWindowProgramStyling: () => ({
    closeWithoutSaving: vi.fn(),
    documentName: ref('WindowProgramStyling'),
    editorHostRef: ref(null),
    monaco: {
      isLoading: ref(false),
      loadError: ref(null)
    },
    saveAndCloseWindow: vi.fn(async () => undefined),
    windowModel: ref(true)
  })
}))

vi.mock('app/src/components/floatingWindows/WindowProgramStyling/scripts/windowProgramStylingKeybindHelp', () => ({
  getMonacoKeybindHelpItems: () => []
}))

import WindowProgramStyling from '../WindowProgramStyling.vue'

beforeEach(() => {
  setActivePinia(createPinia())
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
  w.unmount()
})
