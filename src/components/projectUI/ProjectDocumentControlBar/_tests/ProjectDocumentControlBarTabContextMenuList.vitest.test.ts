import { expect, test } from 'vitest'

import {
  createProjectDocumentControlBarTabContextMenuListHandlers,
  mountProjectDocumentControlBarTabContextMenuList
} from './projectDocumentControlBarTabContextMenuListVitestMount'

test('Test that ProjectDocumentControlBarTabContextMenuList renders browse tabs and keybind hints', () => {
  const wrapper = mountProjectDocumentControlBarTabContextMenuList()

  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu-browseOpenedTabs"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabLeft-keybind"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabRight-keybind"]').exists()).toBe(true)
  expect(wrapper.findAll('[data-test-locator="projectDocumentControlBar-tabContextMenu-browseTab"]').length).toBe(2)
  expect(wrapper.find('[data-test-browse-tab-has-unsaved-changes="true"]').exists()).toBe(true)

  wrapper.unmount()
})

test('Test that ProjectDocumentControlBarTabContextMenuList delegates row and submenu interactions', async () => {
  const handlers = createProjectDocumentControlBarTabContextMenuListHandlers()
  const wrapper = mountProjectDocumentControlBarTabContextMenuList({ handlers })

  const browseActivator = wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-browseOpenedTabs"]')
  await browseActivator.trigger('mouseenter')
  await browseActivator.trigger('mouseleave')
  expect(handlers.onBrowseSubmenuActivatorEnter).toHaveBeenCalled()
  expect(handlers.onSubmenuActivatorLeave).toHaveBeenCalled()

  const submenu = wrapper.get('.q-menu-stub')
  await submenu.trigger('mouseenter')
  await submenu.trigger('mouseleave')
  expect(handlers.onSubmenuContentEnter).toHaveBeenCalled()
  expect(handlers.onSubmenuContentLeave).toHaveBeenCalled()

  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-copyName"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabLeft"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabRight"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-closeThisTab"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChanges"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-forceCloseAllTabs"]').trigger('click')
  await wrapper.get('[data-test-locator="projectDocumentControlBar-tabContextMenu-deleteThisDocument"]').trigger('click')

  expect(handlers.onCopyNameClick).toHaveBeenCalled()
  expect(handlers.onMoveTabLeftClick).toHaveBeenCalled()
  expect(handlers.onMoveTabRightClick).toHaveBeenCalled()
  expect(handlers.onCloseThisTabClick).toHaveBeenCalled()
  expect(handlers.onCloseAllTabsWithoutChangesExceptThisOneClick).toHaveBeenCalled()
  expect(handlers.onCloseAllTabsWithoutChangesClick).toHaveBeenCalled()
  expect(handlers.onForceCloseAllTabsExceptThisOneClick).toHaveBeenCalled()
  expect(handlers.onForceCloseAllTabsClick).toHaveBeenCalled()
  expect(handlers.onDeleteThisDocumentClick).toHaveBeenCalled()

  wrapper.unmount()
})
