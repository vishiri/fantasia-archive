import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import { FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS } from 'app/helpers/openedDocumentTabTestStatusFlagDefaults'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectAppControlBarTabContextMenuBrowseSubmenu from '../ProjectAppControlBarTabContextMenuBrowseSubmenu.vue'

const sampleTab: I_faOpenedDocumentTab = {
  displayNameDraft: 'Hero',
  documentId: 'doc-1',
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
  hasUnsavedChanges: true,
  persistenceState: 'persisted',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  ...FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS,
  tabLabel: 'Character',
  templateIcon: 'mdi-account'
}

const secondTab: I_faOpenedDocumentTab = {
  ...sampleTab,
  documentId: 'doc-2',
  displayNameDraft: 'Villain',
  savedDisplayName: 'Villain',
  hasUnsavedChanges: false,
  templateIcon: 'mdi-skull'
}

/**
 * ProjectAppControlBarTabContextMenuBrowseSubmenu
 * Renders browse tab rows and forwards submenu model updates.
 */
test('Test that ProjectAppControlBarTabContextMenuBrowseSubmenu renders browse tabs and model updates', async () => {
  const onBrowseSubmenuModelUpdate = vi.fn()
  const onSubmenuContentEnter = vi.fn()
  const onSubmenuContentLeave = vi.fn()

  const wrapper = mount(ProjectAppControlBarTabContextMenuBrowseSubmenu, {
    props: {
      activeDocumentTabName: 'doc-1',
      isBrowseSubmenuOpen: true,
      onBrowseSubmenuModelUpdate,
      onSubmenuContentEnter,
      onSubmenuContentLeave,
      openedDocumentTabs: [sampleTab, secondTab],
      resolveBrowseTabLabel: (tab: I_faOpenedDocumentTab) => tab.displayNameDraft,
      resolveBrowseTabRoute: (documentId: string) => `/home/document/${documentId}`,
      resolveDocumentTabAppearanceChrome: () => undefined,
      resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => tab.templateIcon,
      resolveDocumentTabInlineStyle: () => undefined,
      resolveTabWorldIndicatorColor: () => null,
      showWorldTabIndicators: false
    },
    global: {
      stubs: {
        ProjectAppControlBarTabWorldIndicator: true,
        QIcon: { template: '<span />' },
        QItem: {
          inheritAttrs: false,
          props: ['to'],
          template: '<a v-bind="$attrs" :href="to"><slot /></a>'
        },
        QItemSection: { template: '<div><slot /></div>' },
        QList: { template: '<div><slot /></div>' },
        QMenu: {
          emits: ['mouseenter', 'mouseleave', 'update:modelValue'],
          props: ['modelValue'],
          template: `
            <div
              data-test-locator="projectAppControlBar-tabContextMenu-browseSubmenu"
              @mouseenter="$emit('mouseenter')"
              @mouseleave="$emit('mouseleave')"
            >
              <button type="button" data-test-locator="browse-submenu-close" @click="$emit('update:modelValue', false)" />
              <slot />
            </div>
          `
        },
        QSeparator: { template: '<hr />' }
      }
    }
  })

  const browseTabs = wrapper.findAll('[data-test-locator="projectAppControlBar-tabContextMenu-browseTab"]')
  expect(browseTabs).toHaveLength(2)
  expect(browseTabs[0]?.attributes('data-test-browse-tab-active')).toBe('true')
  expect(browseTabs[0]?.attributes('data-test-browse-tab-document-id')).toBe('doc-1')
  expect(browseTabs[1]?.attributes('data-test-browse-tab-has-unsaved-changes')).toBe('false')

  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-browseSubmenu"]').trigger('mouseenter')
  await wrapper.get('[data-test-locator="projectAppControlBar-tabContextMenu-browseSubmenu"]').trigger('mouseleave')
  await wrapper.get('[data-test-locator="browse-submenu-close"]').trigger('click')

  expect(onSubmenuContentEnter).toHaveBeenCalled()
  expect(onSubmenuContentLeave).toHaveBeenCalled()
  expect(onBrowseSubmenuModelUpdate).toHaveBeenCalledWith(false)

  wrapper.unmount()
})
