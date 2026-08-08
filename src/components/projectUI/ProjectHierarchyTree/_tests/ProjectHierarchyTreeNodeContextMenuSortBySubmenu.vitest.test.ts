import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenuSortBySubmenu from '../ProjectHierarchyTreeNodeContextMenuSortBySubmenu.vue'

test('Test that ProjectHierarchyTreeNodeContextMenuSortBySubmenu renders sort items and wires clicks', async () => {
  const onSortByItemClick = vi.fn()
  const onSortBySubmenuModelUpdate = vi.fn()
  const onSubmenuContentEnter = vi.fn()
  const onSubmenuContentLeave = vi.fn()

  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuSortBySubmenu, {
    props: {
      isSortBySubmenuOpen: true,
      onSortByItemClick,
      onSortBySubmenuModelUpdate,
      onSubmenuContentEnter,
      onSubmenuContentLeave,
      resolveSortByItemDetailDirection: () => 'A -> Z',
      resolveSortByItemDetailScope: () => 'direct children',
      resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => `Title ${itemId}`,
      sortByDirectScopeOnly: false
    },
    global: {
      stubs: {
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' },
        QList: { template: '<div><slot /></div>' },
        QMenu: {
          emits: ['mouseenter', 'mouseleave', 'update:modelValue'],
          props: ['modelValue'],
          template: `
            <div
              data-test-locator="projectHierarchyTree-nodeContextMenu-sortBySubmenu"
              @mouseenter="$emit('mouseenter')"
              @mouseleave="$emit('mouseleave')"
            >
              <button type="button" data-test-locator="sort-by-submenu-close" @click="$emit('update:modelValue', false)" />
              <slot />
            </div>
          `
        },
        QSeparator: { template: '<hr />' }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-namesDirectAsc"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-customOrderDirectAsc"]').exists()).toBe(true)

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-namesDirectAsc"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBySubmenu"]').trigger('mouseenter')
  await wrapper.get('[data-test-locator="sort-by-submenu-close"]').trigger('click')

  expect(onSortByItemClick).toHaveBeenCalledWith('namesDirectAsc')
  expect(onSubmenuContentEnter).toHaveBeenCalled()
  expect(onSortBySubmenuModelUpdate).toHaveBeenCalledWith(false)

  wrapper.unmount()
})

/**
 * ProjectHierarchyTreeNodeContextMenuSortBySubmenu
 * Direct-scope-only mode filters recursive sort items out of the submenu list.
 */
test('Test that ProjectHierarchyTreeNodeContextMenuSortBySubmenu filters to direct scope items', () => {
  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuSortBySubmenu, {
    props: {
      isSortBySubmenuOpen: true,
      onSortByItemClick: vi.fn(),
      onSortBySubmenuModelUpdate: vi.fn(),
      onSubmenuContentEnter: vi.fn(),
      onSubmenuContentLeave: vi.fn(),
      resolveSortByItemDetailDirection: () => 'A -> Z',
      resolveSortByItemDetailScope: () => 'direct children',
      resolveSortByItemTitle: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => `Title ${itemId}`,
      sortByDirectScopeOnly: true
    },
    global: {
      stubs: {
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' },
        QList: { template: '<div><slot /></div>' },
        QMenu: {
          emits: ['mouseenter', 'mouseleave', 'update:modelValue'],
          props: ['modelValue'],
          template: `
            <div data-test-locator="projectHierarchyTree-nodeContextMenu-sortBySubmenu">
              <slot />
            </div>
          `
        },
        QSeparator: { template: '<hr />' }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-namesDirectAsc"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-namesRecursiveAsc"]').exists()).toBe(false)
  expect(wrapper.find('[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-customOrderRecursiveDesc"]').exists()).toBe(false)

  wrapper.unmount()
})
