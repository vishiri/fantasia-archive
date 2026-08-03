/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import { defineComponent, h } from 'vue'

import type { I_faVerticalDraggableTabListIdentifiedItem } from 'app/types/I_faVerticalDraggableTabList'
import DialogProjectSettingsEntityTabList from '../DialogProjectSettingsEntityTabList.vue'

const sampleItems: I_faVerticalDraggableTabListIdentifiedItem[] = [
  {
    id: 'item-a'
  },
  {
    id: 'item-b'
  }
]

/**
 * DialogProjectSettingsEntityTabList
 * Forwards list props and add emit through FaVerticalDraggableTabList.
 */
test('Test that DialogProjectSettingsEntityTabList renders list hooks and forwards add', async () => {
  const FaVerticalDraggableTabListStub = defineComponent({
    name: 'FaVerticalDraggableTabList',
    emits: ['add', 'update:items'],
    setup (_props, { emit, slots }) {
      return () => h('div', {
        'data-test-locator': 'dialogProjectSettings-worlds-list'
      }, [
        h('button', {
          'data-test-locator': 'dialogProjectSettings-worlds-addButton',
          onClick: () => {
            emit('add')
          }
        }, 'add'),
        slots.tab?.({
          isBeingDragged: false,
          isListDragging: false,
          isPointerHovered: false,
          item: sampleItems[0]
        })
      ])
    }
  })

  const w = mount(DialogProjectSettingsEntityTabList, {
    props: {
      addButtonLabelKey: 'dialogs.projectSettings.panels.worlds.addWorldButton',
      blockClassSuffix: 'dialogProjectSettingsWorldsTabList',
      cloneList: (items: I_faVerticalDraggableTabListIdentifiedItem[]) => {
        return items.map((item) => ({ ...item }))
      },
      currentLanguageCode: 'en-US',
      dragIdDataAttribute: 'data-test-world-id',
      emptyFilteredKey: 'dialogs.projectSettings.panels.worlds.emptyFilteredWorlds',
      filterAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterAriaLabel',
      filterClearAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterClearAriaLabel',
      filterItems: (list: I_faVerticalDraggableTabListIdentifiedItem[]) => list,
      filterPlaceholderKey: 'dialogs.projectSettings.panels.worlds.filterPlaceholder',
      items: sampleItems,
      testLocatorAddButton: 'dialogProjectSettings-worlds-addButton',
      testLocatorFilterClear: 'dialogProjectSettings-worldsFilterClear',
      testLocatorFilterEmpty: 'dialogProjectSettings-worldsFilterEmpty',
      testLocatorFilterInput: 'dialogProjectSettings-worldsFilterInput',
      testLocatorList: 'dialogProjectSettings-worlds-list'
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        FaVerticalDraggableTabList: FaVerticalDraggableTabListStub
      }
    },
    slots: {
      tab: ({ item }: { item: I_faVerticalDraggableTabListIdentifiedItem }) => {
        return h('span', {
          'data-test-locator': 'entity-tab-slot'
        }, item.id)
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-list"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-worlds-addButton"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="entity-tab-slot"]').text()).toBe('item-a')

  await w.get('[data-test-locator="dialogProjectSettings-worlds-addButton"]').trigger('click')
  expect(w.emitted('add')).toHaveLength(1)
})
