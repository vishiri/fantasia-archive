import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectDocumentControlBarTabContextMenuCloseRows from '../ProjectDocumentControlBarTabContextMenuCloseRows.vue'

test('Test that ProjectDocumentControlBarTabContextMenuCloseRows delegates close row clicks', async () => {
  const onCloseThisTabClick = vi.fn()
  const onCloseAllTabsWithoutChangesExceptThisOneClick = vi.fn()
  const onCloseAllTabsWithoutChangesClick = vi.fn()

  const wrapper = mount(ProjectDocumentControlBarTabContextMenuCloseRows, {
    props: {
      closeAllTabsWithoutChangesExceptThisOneLabel: 'Close all except this one',
      closeAllTabsWithoutChangesLabel: 'Close all without changes',
      closeThisTabLabel: 'Close this tab',
      onCloseAllTabsWithoutChangesClick,
      onCloseAllTabsWithoutChangesExceptThisOneClick,
      onCloseThisTabClick
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

  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-closeThisTab"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChanges"]').trigger('click')

  expect(onCloseThisTabClick).toHaveBeenCalled()
  expect(onCloseAllTabsWithoutChangesExceptThisOneClick).toHaveBeenCalled()
  expect(onCloseAllTabsWithoutChangesClick).toHaveBeenCalled()

  wrapper.unmount()
})
