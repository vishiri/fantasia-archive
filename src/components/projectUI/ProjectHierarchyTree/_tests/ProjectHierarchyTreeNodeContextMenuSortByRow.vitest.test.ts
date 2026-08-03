import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenuSortByRow from '../ProjectHierarchyTreeNodeContextMenuSortByRow.vue'

test('Test that ProjectHierarchyTreeNodeContextMenuSortByRow wires activator enter and leave', async () => {
  const onSortByItemClick = vi.fn()
  const onSortBySubmenuActivatorEnter = vi.fn()
  const onSortBySubmenuModelUpdate = vi.fn()
  const onSubmenuActivatorLeave = vi.fn()
  const onSubmenuContentEnter = vi.fn()
  const onSubmenuContentLeave = vi.fn()

  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuSortByRow, {
    props: {
      isSortBySubmenuOpen: false,
      onSortByItemClick,
      onSortBySubmenuActivatorEnter,
      onSortBySubmenuModelUpdate,
      onSubmenuActivatorLeave,
      onSubmenuContentEnter,
      onSubmenuContentLeave,
      resolveSortByItemDetailDirection: () => 'A -> Z',
      resolveSortByItemDetailScope: () => 'direct children',
      resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => `Title ${itemId}`,
      sortByLabel: 'Sort by'
    },
    global: {
      stubs: {
        ProjectHierarchyTreeNodeContextMenuSortBySubmenu: true,
        QIcon: { template: '<span />' },
        QItem: {
          emits: ['mouseenter', 'mouseleave'],
          template: '<div @mouseenter="$emit(\'mouseenter\')" @mouseleave="$emit(\'mouseleave\')"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Sort by')

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy"]').trigger('mouseenter')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy"]').trigger('mouseleave')

  expect(onSortBySubmenuActivatorEnter).toHaveBeenCalled()
  expect(onSubmenuActivatorLeave).toHaveBeenCalled()

  wrapper.unmount()
})
