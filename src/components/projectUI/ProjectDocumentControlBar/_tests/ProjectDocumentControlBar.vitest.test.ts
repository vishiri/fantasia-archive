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
        onSaveDocumentClick: () => undefined,
        onTabAuxClick: () => undefined,
        onTabCloseClick: () => undefined,
        openedDocumentTabs: openedDocumentTabsRef,
        resolveDocumentTabLabel: (tab: { displayNameDraft: string, tabLabel: string }) => {
          return tab.displayNameDraft.length > 0 ? tab.displayNameDraft : tab.tabLabel
        },
        resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
        saveDocumentButtonColor: 'primary-bright',
        showDocumentControlBar: showDocumentControlBarRef,
        showDocumentTabs: showDocumentTabsRef,
        showEditDocumentButton: false,
        showSaveDocumentButtons: false
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
          editDocumentTooltip: 'Edit current document',
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
