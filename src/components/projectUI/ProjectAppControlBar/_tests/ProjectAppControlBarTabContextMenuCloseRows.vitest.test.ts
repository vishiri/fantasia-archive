import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import ProjectAppControlBarTabContextMenuCloseRows from '../ProjectAppControlBarTabContextMenuCloseRows.vue'

test('Test that ProjectAppControlBarTabContextMenuCloseRows delegates close row clicks', async () => {
  const onCloseThisTabClick = vi.fn()
  const onCloseAllTabsWithoutChangesExceptThisOneClick = vi.fn()
  const onCloseAllTabsWithoutChangesClick = vi.fn()

  const wrapper = mount(ProjectAppControlBarTabContextMenuCloseRows, {
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
        QSeparator: {
          inheritAttrs: false,
          template: '<hr v-bind="$attrs" />'
        }
      }
    }
  })

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeThisTab"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeAllTabsWithoutChanges"]').trigger('click')

  const closeThisTab = wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeThisTab"]')
  expect(closeThisTab.element.previousElementSibling?.classList.contains('projectAppControlBarTabContextMenu__separatorPrimaryBright')).toBe(true)

  expect(onCloseThisTabClick).toHaveBeenCalled()
  expect(onCloseAllTabsWithoutChangesExceptThisOneClick).toHaveBeenCalled()
  expect(onCloseAllTabsWithoutChangesClick).toHaveBeenCalled()

  wrapper.unmount()
})
