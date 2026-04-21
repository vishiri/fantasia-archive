import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, ref } from 'vue'
import { beforeEach, expect, test, vi } from 'vitest'

import dialogProgramStyling from 'app/i18n/en-US/dialogs/L_programStyling'

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => ({
  registerComponentDialogStackGuard: vi.fn()
}))

vi.mock('app/src/components/dialogs/DialogProgramStyling/scripts/dialogProgramStylingState', () => ({
  useDialogProgramStyling: () => ({
    closeWithoutSaving: vi.fn(),
    dialogModel: ref(true),
    documentName: ref('ProgramStyling'),
    editorHostRef: ref(null),
    monaco: {
      isLoading: ref(false),
      loadError: ref(null)
    },
    onDialogHide: vi.fn(),
    onDialogShow: vi.fn(async () => undefined),
    saveAndCloseDialog: vi.fn(async () => undefined)
  })
}))

vi.mock('app/src/components/dialogs/DialogProgramStyling/scripts/dialogProgramStylingKeybindHelp', () => ({
  getMonacoKeybindHelpItems: () => []
}))

import DialogProgramStyling from '../DialogProgramStyling.vue'

const programStylingQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      default: false,
      type: Boolean
    }
  },
  emits: ['update:modelValue', 'show', 'hide'],
  template: `
    <div class="program-styling-qdialog-stub" v-bind="$attrs">
      <div v-if="modelValue" class="program-styling-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * DialogProgramStyling
 * Mounts with stubbed dialog shell and shows the title and primary actions from the production template.
 */
const programStylingT = (k: string): string => {
  if (k === 'dialogs.programStyling.title') {
    return dialogProgramStyling.title
  }
  if (k === 'dialogs.programStyling.closeWithoutSaving') {
    return dialogProgramStyling.closeWithoutSaving
  }
  if (k === 'dialogs.programStyling.saveButton') {
    return dialogProgramStyling.saveButton
  }
  if (k === 'dialogs.programStyling.helpTooltip.aria') {
    return dialogProgramStyling.helpTooltip.aria
  }
  if (k === 'dialogs.programStyling.loading') {
    return dialogProgramStyling.loading
  }
  return k
}

test('Test that DialogProgramStyling surfaces title and action button locators', () => {
  const w = mount(DialogProgramStyling, {
    global: {
      mocks: { $t: programStylingT },
      stubs: {
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
        QDialog: programStylingQDialogStub,
        QIcon: { template: '<i><slot /></i>' },
        QSpinnerDots: { template: '<span />' },
        QTooltip: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProgramStyling-title"]').text()).toContain(dialogProgramStyling.title)
  expect(w.find('[data-test-locator="dialogProgramStyling-button-close"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProgramStyling-button-save"]').exists()).toBe(true)
  w.unmount()
})
