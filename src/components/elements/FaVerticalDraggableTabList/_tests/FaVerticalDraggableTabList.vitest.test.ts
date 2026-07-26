/* eslint-disable vue/one-component-per-file -- colocated stubs for Vue Test Utils mounts */

import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
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

const listMountProps = {
  addButtonLabelKey: 'dialogs.projectSettings.panels.worlds.addWorldButton',
  blockClassSuffix: 'dialogProjectSettingsWorldsTabList',
  cloneList: (list: { id: string }[]) => list.map((item) => ({ ...item })),
  currentLanguageCode: 'en-US' as const,
  dragIdDataAttribute: 'data-test-world-id',
  emptyFilteredKey: 'dialogs.projectSettings.panels.worlds.emptyFilteredWorlds',
  filterAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterAriaLabel',
  filterClearAriaLabelKey: 'dialogs.projectSettings.panels.worlds.filterClearAriaLabel',
  filterItems: (list: { id: string }[]) => list,
  filterPlaceholderKey: 'dialogs.projectSettings.panels.worlds.filterPlaceholder',
  items: [{ id: 'world-1' }, { id: 'world-2' }],
  testLocatorAddButton: 'dialogProjectSettings-worlds-addButton',
  testLocatorFilterClear: 'dialogProjectSettings-worldsFilterClear',
  testLocatorFilterEmpty: 'dialogProjectSettings-worldsFilterEmpty',
  testLocatorFilterInput: 'dialogProjectSettings-worldsFilterInput',
  testLocatorList: 'dialogProjectSettings-worlds-list'
}

function mountTabList () {
  return mount(FaVerticalDraggableTabList, {
    props: listMountProps,
    global: {
      components: { VueDraggable: vueDraggableStub },
      mocks: { $t: (key: string) => key },
      stubs: {
        DialogProjectSettingsVerticalTabListFilterInput: true,
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button type="button" v-bind="$attrs"><slot /></button>'
        }),
        QSeparator: true
      }
    },
    slots: {
      tab: ({
        item,
        isPointerHovered
      }: {
        item: { id: string }
        isPointerHovered: boolean
      }) => h('div', {
        class: {
          faVerticalDraggableTabs__tab: true,
          'faVerticalDraggableTabs__tab--pointerHover': isPointerHovered
        },
        'data-test-world-id': item.id
      })
    }
  })
}

/**
 * FaVerticalDraggableTabList
 * Exposes the configured list test locator on the scroll container.
 */
test('Test that FaVerticalDraggableTabList renders list test locator', () => {
  const wrapper = mountTabList()

  expect(wrapper.find('[data-test-locator="dialogProjectSettings-worlds-list"]').exists()).toBe(true)
})

/**
 * FaVerticalDraggableTabList
 * Pointer hover class tracks the tab under the pointer (not sticky CSS :hover).
 */
test('Test that FaVerticalDraggableTabList applies pointerHover from pointermove', async () => {
  const wrapper = mountTabList()
  const tab = wrapper.find('[data-test-world-id="world-1"]')

  await tab.trigger('pointermove', {
    clientX: 12,
    clientY: 34
  })
  await wrapper.vm.$nextTick()

  expect(tab.classes()).toContain('faVerticalDraggableTabs__tab--pointerHover')
  expect(wrapper.find('[data-test-world-id="world-2"]').classes()).not.toContain(
    'faVerticalDraggableTabs__tab--pointerHover'
  )
})

/**
 * FaVerticalDraggableTabList
 * Leaving the scroll region clears pointer hover when relatedTarget is outside.
 */
test('Test that FaVerticalDraggableTabList clears pointerHover on pointerleave', async () => {
  const wrapper = mountTabList()
  const tab = wrapper.find('[data-test-world-id="world-1"]')

  await tab.trigger('pointermove', {
    clientX: 12,
    clientY: 34
  })
  await wrapper.vm.$nextTick()
  expect(tab.classes()).toContain('faVerticalDraggableTabs__tab--pointerHover')

  await wrapper.find('[data-test-locator="dialogProjectSettings-worlds-list"]').trigger('pointerleave', {
    relatedTarget: document.body
  })
  await wrapper.vm.$nextTick()

  expect(wrapper.find('[data-test-world-id="world-1"]').classes()).not.toContain(
    'faVerticalDraggableTabs__tab--pointerHover'
  )
})

/**
 * FaVerticalDraggableTabList
 * Drag start clears hover, sets dragging id, and applies document drag cursor.
 */
test('Test that FaVerticalDraggableTabList handles drag start', async () => {
  const wrapper = mountTabList()
  const tabEl = wrapper.find('[data-test-world-id="world-1"]').element as HTMLElement

  await wrapper.findComponent(vueDraggableStub).vm.$emit('start', { item: tabEl })
  await wrapper.vm.$nextTick()

  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(true)
  expect(wrapper.find('.faVerticalDraggableTabs').classes()).toContain(
    'faVerticalDraggableTabs--listDragging'
  )

  await wrapper.findComponent(vueDraggableStub).vm.$emit('end')
  await wrapper.vm.$nextTick()
  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(false)
})

/**
 * FaVerticalDraggableTabList
 * Add button emits add for the parent list host.
 */
test('Test that FaVerticalDraggableTabList emits add from add button', async () => {
  const wrapper = mountTabList()

  await wrapper.find('[data-test-locator="dialogProjectSettings-worlds-addButton"]').trigger('click')

  expect(wrapper.emitted('add')).toHaveLength(1)
})

/**
 * FaVerticalDraggableTabList
 * After drag end, clear hover then resync from last pointer point after Sortable animation.
 */
test('Test that FaVerticalDraggableTabList resyncs pointerHover after drag animation', async () => {
  vi.useFakeTimers()

  const wrapper = mountTabList()
  const world2Tab = wrapper.find('[data-test-world-id="world-2"]').element
  const elementFromPointSpy = vi.spyOn(document, 'elementFromPoint').mockReturnValue(world2Tab)

  const world1Tab = wrapper.find('[data-test-world-id="world-1"]')
  await world1Tab.trigger('pointermove', {
    clientX: 40,
    clientY: 50
  })
  await wrapper.vm.$nextTick()
  expect(world1Tab.classes()).toContain('faVerticalDraggableTabs__tab--pointerHover')

  await wrapper.findComponent(vueDraggableStub).vm.$emit('end')
  await wrapper.vm.$nextTick()
  expect(wrapper.find('[data-test-world-id="world-1"]').classes()).not.toContain(
    'faVerticalDraggableTabs__tab--pointerHover'
  )

  await vi.advanceTimersByTimeAsync(150)
  await flushPromises()
  await wrapper.vm.$nextTick()

  expect(elementFromPointSpy).toHaveBeenCalled()
  expect(wrapper.find('[data-test-world-id="world-2"]').classes()).toContain(
    'faVerticalDraggableTabs__tab--pointerHover'
  )

  elementFromPointSpy.mockRestore()
  vi.useRealTimers()
})

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.useRealTimers()
})
