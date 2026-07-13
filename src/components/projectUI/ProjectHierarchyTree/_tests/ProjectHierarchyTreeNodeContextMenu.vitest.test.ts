/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import ProjectHierarchyTreeNodeContextMenu from '../ProjectHierarchyTreeNodeContextMenu.vue'

const hierarchyTreeContextMenuI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectHierarchyTree: {
          contextMenu: {
            collapseAllUnderNode: 'Collapse all under this node',
            expandAllUnderNode: 'Expand all under this node'
          }
        }
      }
    }
  }
})

function mountHierarchyTreeContextMenu () {
  const isOpen = ref(true)
  const onExpandAllClick = vi.fn()
  const onCollapseAllClick = vi.fn()
  const onHide = vi.fn()
  const wrapper = mount(ProjectHierarchyTreeNodeContextMenu, {
    props: {
      anchorNodeId: 'world-1',
      isOpen: true,
      menuTargetElement: document.createElement('div'),
      onCollapseAllClick,
      onExpandAllClick,
      onHide,
      'onUpdate:isOpen': (value: boolean) => {
        isOpen.value = value
      }
    },
    global: {
      plugins: [hierarchyTreeContextMenuI18n],
      stubs: {
        QIcon: true,
        QItem: {
          emits: ['click'],
          template: '<button type="button" @click="$emit(\'click\', $event)"><slot /></button>'
        },
        QItemSection: {
          template: '<span><slot /></span>'
        },
        QList: {
          template: '<div><slot /></div>'
        },
        QMenu: {
          emits: ['hide', 'update:modelValue'],
          props: ['modelValue', 'target'],
          template: '<div data-test-locator="projectHierarchyTree-nodeContextMenu" :data-test-menu-target="target ? \'set\' : \'unset\'"><button data-test-locator="projectHierarchyTree-nodeContextMenu-close" type="button" @click="$emit(\'update:modelValue\', false)" /><button data-test-locator="projectHierarchyTree-nodeContextMenu-hide" type="button" @click="$emit(\'hide\')" /><slot /></div>'
        }
      }
    }
  })

  return {
    isOpen,
    onCollapseAllClick,
    onExpandAllClick,
    onHide,
    wrapper
  }
}

test('ProjectHierarchyTreeNodeContextMenu renders expand and collapse actions', () => {
  const { wrapper } = mountHierarchyTreeContextMenu()
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').attributes('data-test-hierarchy-node-id')).toBe('world-1')
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').attributes('data-test-menu-target')).toBe('set')
  expect(wrapper.text()).toContain('Expand all under this node')
  expect(wrapper.text()).toContain('Collapse all under this node')
})

test('ProjectHierarchyTreeNodeContextMenu omits anchor metadata when props are null', () => {
  const wrapper = mount(ProjectHierarchyTreeNodeContextMenu, {
    props: {
      anchorNodeId: null,
      isOpen: false,
      menuTargetElement: null,
      onCollapseAllClick: vi.fn(),
      onExpandAllClick: vi.fn(),
      onHide: vi.fn(),
      'onUpdate:isOpen': vi.fn()
    },
    global: {
      plugins: [hierarchyTreeContextMenuI18n],
      stubs: {
        QIcon: true,
        QItem: {
          template: '<div><slot /></div>'
        },
        QItemSection: {
          template: '<span><slot /></span>'
        },
        QList: {
          template: '<div><slot /></div>'
        },
        QMenu: {
          props: ['target'],
          template: '<div data-test-locator="projectHierarchyTree-nodeContextMenu" :data-test-menu-target="target ? \'set\' : \'unset\'"><slot /></div>'
        }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').attributes('data-test-hierarchy-node-id')).toBeUndefined()
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu"]').attributes('data-test-menu-target')).toBe('unset')
  wrapper.unmount()
})

test('ProjectHierarchyTreeNodeContextMenu delegates menu item clicks and hide', async () => {
  const { isOpen, onCollapseAllClick, onExpandAllClick, onHide, wrapper } = mountHierarchyTreeContextMenu()

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-hide"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-close"]').trigger('click')

  expect(onExpandAllClick).toHaveBeenCalled()
  expect(onCollapseAllClick).toHaveBeenCalled()
  expect(onHide).toHaveBeenCalled()
  expect(isOpen.value).toBe(false)
})
