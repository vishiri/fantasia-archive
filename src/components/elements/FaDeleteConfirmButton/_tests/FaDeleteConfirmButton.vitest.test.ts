/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import FaDeleteConfirmButton from '../FaDeleteConfirmButton.vue'

const qBtnStub = defineComponent({
  inheritAttrs: true,
  props: {
    disable: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    }
  },
  template: '<button type="button" :disabled="disable" v-bind="$attrs"><slot />{{ label }}</button>'
})

const qMenuStub = defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<div v-if="modelValue" class="q-menu-stub"><slot /></div>'
})

const qTooltipStub = defineComponent({
  template: '<div class="q-tooltip-stub"><slot /></div>'
})

/**
 * FaDeleteConfirmButton
 * Renders the delete trigger label from i18n key props.
 */
test('Test that FaDeleteConfirmButton renders delete label from i18n key', () => {
  const wrapper = mount(FaDeleteConfirmButton, {
    props: {
      confirmButtonTestLocator: 'confirm-btn',
      confirmMenuTestLocator: 'confirm-menu',
      confirmMessageTestLocator: 'confirm-message',
      countdownTestLocator: 'confirm-countdown',
      deleteButtonLabelKey: 'dialogs.projectSettings.panels.worlds.deleteWorldButton',
      deleteConfirmConfirmButtonKey: 'dialogs.projectSettings.panels.worlds.deleteConfirm.confirmDeleteButton',
      deleteConfirmMessageKey: 'dialogs.projectSettings.panels.worlds.deleteConfirm.message',
      removeButtonTestLocator: 'remove-btn',
      removeDisabled: false
    },
    global: {
      components: {
        QBtn: qBtnStub,
        QMenu: qMenuStub,
        QTooltip: qTooltipStub
      },
      mocks: {
        $t: (key: string) => key
      }
    }
  })

  expect(wrapper.get('[data-test-locator="remove-btn"]').text()).toContain(
    'dialogs.projectSettings.panels.worlds.deleteWorldButton'
  )
})
