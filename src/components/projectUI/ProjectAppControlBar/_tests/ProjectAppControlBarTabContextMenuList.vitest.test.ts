import { expect, test } from 'vitest'

import {
  createProjectAppControlBarTabContextMenuListHandlers,
  mountProjectAppControlBarTabContextMenuList,
  projectAppControlBarTabContextMenuSampleTab
} from './projectAppControlBarTabContextMenuListVitestMount'

test('Test that ProjectAppControlBarTabContextMenuList renders browse tabs and keybind hints', () => {
  const wrapper = mountProjectAppControlBarTabContextMenuList()

  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-browseOpenedTabs"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-moveTabLeft-keybind"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-moveTabRight-keybind"]').exists()).toBe(true)
  expect(wrapper.findAll('[data-test-locator="projectAppControlBar-tabContextMenu-browseTab"]').length).toBe(2)
  expect(wrapper.find('[data-test-browse-tab-has-unsaved-changes="true"]').exists()).toBe(true)

  wrapper.unmount()
})

test('Test that ProjectAppControlBarTabContextMenuList delegates row and submenu interactions', async () => {
  const handlers = createProjectAppControlBarTabContextMenuListHandlers()
  const wrapper = mountProjectAppControlBarTabContextMenuList({ handlers })

  const browseActivator = wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-browseOpenedTabs"]')
  await browseActivator.trigger('mouseenter')
  await browseActivator.trigger('mouseleave')
  expect(handlers.onBrowseSubmenuActivatorEnter).toHaveBeenCalled()
  expect(handlers.onSubmenuActivatorLeave).toHaveBeenCalled()

  const submenu = wrapper.get('.q-menu-stub')
  await submenu.trigger('mouseenter')
  await submenu.trigger('mouseleave')
  expect(handlers.onSubmenuContentEnter).toHaveBeenCalled()
  expect(handlers.onSubmenuContentLeave).toHaveBeenCalled()

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyName"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyTextColor"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyBackgroundColor"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyDocument"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-addNewDocumentUnderThis"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-moveTabLeft"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-moveTabRight"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeThisTab"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-closeAllTabsWithoutChanges"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-forceCloseAllTabs"]').trigger('click')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-deleteThisDocument"]').trigger('click')

  expect(handlers.onCopyNameClick).toHaveBeenCalled()
  expect(handlers.onCopyTextColorClick).toHaveBeenCalled()
  expect(handlers.onCopyBackgroundColorClick).toHaveBeenCalled()
  expect(handlers.onCopyDocumentClick).toHaveBeenCalled()
  expect(handlers.onAddNewDocumentUnderThisClick).toHaveBeenCalled()
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

test('Test that ProjectAppControlBarTabContextMenuList renders document action rows and separators', () => {
  const wrapper = mountProjectAppControlBarTabContextMenuList({
    showDeleteThisDocument: false
  })

  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-copyDocument"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabContextMenu-addNewDocumentUnderThis"]').exists()).toBe(true)
  expect(wrapper.findAll('.projectAppControlBarTabContextMenu__separatorPrimaryBright').length).toBe(3)

  const copyDocument = wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-copyDocument"]')
  expect(copyDocument.element.previousElementSibling?.classList.contains('projectAppControlBarTabContextMenu__separatorPrimaryBright')).toBe(true)
  expect(copyDocument.element.nextElementSibling?.classList.contains('projectAppControlBarTabContextMenu__separatorAlt')).toBe(true)

  wrapper.unmount()
})

test('Test that ProjectAppControlBarTabContextMenuList applies browse tab appearance chrome and world indicators', () => {
  const coloredTab = {
    ...projectAppControlBarTabContextMenuSampleTab,
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  }
  const wrapper = mountProjectAppControlBarTabContextMenuList({
    openedDocumentTabs: [coloredTab],
    resolveTabWorldIndicatorColor: () => '#ff00ff',
    showWorldTabIndicators: true
  })

  const browseTab = wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-browseTab"]')
  expect(browseTab.classes()).toContain('projectAppControlBarTabContextMenu__item--browseTabCustomAppearance')
  expect(browseTab.attributes('style')).toContain('background-color: #112233')
  expect(browseTab.attributes('style')).toContain('--projectAppControlBarTab-textColor: #aabbcc')
  expect(wrapper.find('[data-test-locator="projectAppControlBar-tabWorldIndicator-doc-1"]').exists()).toBe(true)

  wrapper.unmount()
})
