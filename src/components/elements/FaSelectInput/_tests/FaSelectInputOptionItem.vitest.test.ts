import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test, vi } from 'vitest'

import FaSelectInputOptionItem from '../FaSelectInputOptionItem.vue'

const qItemStub = defineComponent({
  name: 'QItem',
  template: '<div class="q-item-stub" v-bind="$attrs"><slot /></div>'
})

test('Test that FaSelectInputOptionItem ignores Enter while an IME composition is active', async () => {
  const onKeydown = vi.fn()
  const wrapper = mount(FaSelectInputOptionItem, {
    global: {
      stubs: {
        QIcon: true,
        QItem: qItemStub,
        QItemLabel: true,
        QItemSection: true
      }
    },
    props: {
      iconClass: undefined,
      iconName: null,
      iconStyle: null,
      index: 0,
      itemProps: {
        onKeydown
      },
      labelSegments: [
        {
          isMatch: false,
          text: 'Hero'
        }
      ],
      opt: {
        id: 'opt-1',
        name: 'Hero'
      },
      testLocator: 'faSelectInput'
    }
  })

  await wrapper.find('.q-item-stub').trigger('keydown', {
    isComposing: true,
    key: 'Enter'
  })
  expect(onKeydown).not.toHaveBeenCalled()
})
