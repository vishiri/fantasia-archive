import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { expect, test } from 'vitest'

import FaVerticalDraggableTabList from '../FaVerticalDraggableTabList.vue'

const vueDraggableStub = defineComponent({
  name: 'VueDraggable',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup (props, { slots }) {
    return () => h('div', { class: 'vue-draggable-stub' }, slots.default?.())
  }
})

/**
 * FaVerticalDraggableTabList
 * Exposes the configured list test locator on the scroll container.
 */
test('Test that FaVerticalDraggableTabList renders list test locator', () => {
  const wrapper = mount(FaVerticalDraggableTabList, {
    props: {
      addButtonLabelKey: 'dialogs.projectSettings.panels.worlds.addWorldButton',
      blockClassSuffix: 'dialogProjectSettingsWorldsTabList',
      cloneList: (list: { id: string }[]) => list.map((item) => ({ ...item })),
      currentLanguageCode: 'en-US',
      dragIdDataAttribute: 'data-test-world-id',
      emptyFilteredKey: 'dialogs.projectSettings.panels.worlds.emptyFilteredWorlds',
      filterAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterAriaLabel',
      filterClearAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterClearAriaLabel',
      filterItems: (list) => list,
      filterPlaceholderKey: 'dialogs.projectSettings.panels.worlds.filterPlaceholder',
      items: [{ id: 'world-1' }],
      testLocatorAddButton: 'dialogProjectSettings-worlds-addButton',
      testLocatorFilterClear: 'dialogProjectSettings-worldsFilterClear',
      testLocatorFilterEmpty: 'dialogProjectSettings-worldsFilterEmpty',
      testLocatorFilterInput: 'dialogProjectSettings-worldsFilterInput',
      testLocatorList: 'dialogProjectSettings-worlds-list'
    },
    global: {
      components: { VueDraggable: vueDraggableStub },
      mocks: { $t: (key: string) => key },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: true,
        QBtn: true,
        QSeparator: true
      }
    },
    slots: {
      tab: '<div class="faVerticalDraggableTabs__tab" />'
    }
  })

  expect(wrapper.find('[data-test-locator="dialogProjectSettings-worlds-list"]').exists()).toBe(true)
})
