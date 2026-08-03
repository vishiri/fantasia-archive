import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectHierarchyTreeNodeContextMenuBulkRows from '../ProjectHierarchyTreeNodeContextMenuBulkRows.vue'

test('Test that ProjectHierarchyTreeNodeContextMenuBulkRows delegates expand and collapse clicks', async () => {
  const onCollapseAllClick = vi.fn()
  const onExpandAllClick = vi.fn()

  const wrapper = mount(ProjectHierarchyTreeNodeContextMenuBulkRows, {
    props: {
      collapseAllUnderNodeLabel: 'Collapse all under this node',
      expandAllUnderNodeLabel: 'Expand all under this node',
      onCollapseAllClick,
      onExpandAllClick
    },
    global: {
      stubs: {
        QIcon: { template: '<span />' },
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' },
        QSeparator: { template: '<hr />' }
      }
    }
  })

  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"]').trigger('click')
  await wrapper.get('[data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"]').trigger('click')

  expect(onExpandAllClick).toHaveBeenCalled()
  expect(onCollapseAllClick).toHaveBeenCalled()

  wrapper.unmount()
})
