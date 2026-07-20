import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectAppControlBarTabContextMenuDestructiveRows from '../ProjectAppControlBarTabContextMenuDestructiveRows.vue'

test('Test that ProjectAppControlBarTabContextMenuDestructiveRows delegates destructive row clicks', async () => {
  const onDeleteThisDocumentClick = vi.fn()
  const onForceCloseAllTabsClick = vi.fn()
  const onForceCloseAllTabsExceptThisOneClick = vi.fn()

  const wrapper = mount(ProjectAppControlBarTabContextMenuDestructiveRows, {
    props: {
      deleteThisDocumentLabel: 'Delete this document',
      forceCloseAllTabsExceptThisOneLabel: 'Force close all except this one',
      forceCloseAllTabsLabel: 'Force close all tabs',
      onDeleteThisDocumentClick,
      onForceCloseAllTabsClick,
      onForceCloseAllTabsExceptThisOneClick,
      showDeleteThisDocument: true
    },
    global: {
      stubs: {
        QIcon: { template: '<span />' },
        QItem: {
          emits: ['click'],
          template: '<div @click="$emit(\'click\', $event)"><slot /></div>'
        },
        QItemSection: { template: '<div><slot /></div>' }
      }
    }
  })

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-forceCloseAllTabs"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-deleteThisDocument"]').trigger('click')

  expect(onForceCloseAllTabsExceptThisOneClick).toHaveBeenCalled()
  expect(onForceCloseAllTabsClick).toHaveBeenCalled()
  expect(onDeleteThisDocumentClick).toHaveBeenCalled()

  wrapper.unmount()
})

test('Test that ProjectAppControlBarTabContextMenuDestructiveRows hides delete row when showDeleteThisDocument is false', () => {
  const wrapper = mount(ProjectAppControlBarTabContextMenuDestructiveRows, {
    props: {
      deleteThisDocumentLabel: 'Delete this document',
      forceCloseAllTabsExceptThisOneLabel: 'Force close all except this one',
      forceCloseAllTabsLabel: 'Force close all tabs',
      onDeleteThisDocumentClick: vi.fn(),
      onForceCloseAllTabsClick: vi.fn(),
      onForceCloseAllTabsExceptThisOneClick: vi.fn(),
      showDeleteThisDocument: false
    },
    global: {
      stubs: {
        QIcon: { template: '<span />' },
        QItem: { template: '<div><slot /></div>' },
        QItemSection: { template: '<div><slot /></div>' }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-deleteThisDocument"]').exists()).toBe(false)
  wrapper.unmount()
})
