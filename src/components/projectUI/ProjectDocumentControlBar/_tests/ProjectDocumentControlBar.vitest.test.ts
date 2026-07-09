/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

const { showDocumentControlBarRef, openedDocumentTabsRef, showDocumentTabsRef, activeDocumentTabNameRef } = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    activeDocumentTabNameRef: ref(undefined),
    openedDocumentTabsRef: ref([]),
    showDocumentControlBarRef: ref(true),
    showDocumentTabsRef: ref(false)
  }
})

vi.mock('../scripts/projectDocumentControlBar_manager', () => {
  return {
    FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR: '[data-test-locator="mainLayoutHeader"]',
    useProjectDocumentControlBar: () => {
      return {
        activeDocumentTabName: activeDocumentTabNameRef,
        onEnterEditModeClick: () => undefined,
        onDeleteCurrentDocumentClick: () => undefined,
        onSaveDocumentClick: () => undefined,
        onTabAuxClick: () => undefined,
        onTabCloseAllWithoutChangesClick: () => undefined,
        onTabCloseAllWithoutChangesExceptClick: () => undefined,
        onTabCloseClick: () => undefined,
        onTabCopyNameClick: async () => undefined,
        onTabMoveClick: () => undefined,
        moveDocumentTabLeftKeybindLabel: null,
        moveDocumentTabRightKeybindLabel: null,
        openedDocumentTabs: openedDocumentTabsRef,
        resolveDocumentTabLabel: (tab: { displayNameDraft: string, tabLabel: string }) => {
          return tab.displayNameDraft.length > 0 ? tab.displayNameDraft : tab.tabLabel
        },
        resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
        saveDocumentButtonColor: 'primary-bright',
        showDocumentControlBar: showDocumentControlBarRef,
        showDeleteDocumentButton: false,
        showDocumentTabs: showDocumentTabsRef,
        showEditDocumentButton: false,
        showSaveDocumentButtons: false,
        editDocumentKeybindLabel: null,
        saveDocumentKeepEditModeKeybindLabel: null,
        saveDocumentKeybindLabel: null
      }
    }
  }
})

import ProjectDocumentControlBar from '../ProjectDocumentControlBar.vue'

const testI18n = createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      projectUI: {
        projectDocumentControlBar: {
          browseOpenedTabs: 'Browse opened tabs',
          closeAllTabsWithoutChanges: 'Close all tabs without changes',
          closeAllTabsWithoutChangesExceptThisOne: 'Close all tabs without changes except for this one',
          closeThisTab: 'Close this tab',
          copyName: 'Copy name',
          copyNameFailed: 'Could not copy document name to the clipboard.',
          copyNameSuccess: 'Document name copied to the clipboard.',
          deleteCurrentDocumentTooltip: 'Delete current document',
          editDocumentTooltip: 'Edit current document',
          moveTabLeft: 'Move tab left',
          moveTabRight: 'Move tab right',
          saveDocumentKeepEditModeTooltip: 'Save document without exiting edit mode',
          saveDocumentTooltip: 'Save current document'
        }
      }
    }
  }
})

function mountControlBar () {
  return mount(ProjectDocumentControlBar, {
    global: {
      plugins: [testI18n],
      stubs: {
        DialogDeleteOpenedDocument: true,
        DialogDiscardOpenedDocumentTab: true,
        Teleport: true
      }
    }
  })
}

test('Test that ProjectDocumentControlBar renders when showDocumentControlBar is true', () => {
  showDocumentControlBarRef.value = true
  const wrapper = mountControlBar()
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar"]').exists()).toBe(true)
  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar is hidden when showDocumentControlBar is false', () => {
  showDocumentControlBarRef.value = false
  const wrapper = mountControlBar()
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar"]').exists()).toBe(false)
  wrapper.unmount()
})
