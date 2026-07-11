/** @vitest-environment jsdom */
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import {
  projectDocumentControlBarTabContextMenuSampleTab
} from './projectDocumentControlBarTabContextMenuListVitestMount'

const controlBarHandlers = vi.hoisted(() => ({
  onEnterEditModeClick: vi.fn(),
  onDeleteCurrentDocumentClick: vi.fn(),
  onSaveDocumentClick: vi.fn(),
  onTabAuxClick: vi.fn(),
  onTabCloseAllWithoutChangesClick: vi.fn(),
  onTabCloseAllWithoutChangesExceptClick: vi.fn(),
  onTabCloseClick: vi.fn(),
  onTabCopyNameClick: vi.fn(async () => undefined),
  onTabDeleteClick: vi.fn(),
  onTabForceCloseAllClick: vi.fn(),
  onTabForceCloseAllExceptClick: vi.fn(),
  onTabMoveClick: vi.fn()
}))

const {
  activeDocumentTabNameRef,
  editDocumentKeybindLabelRef,
  moveDocumentTabLeftKeybindLabelRef,
  moveDocumentTabRightKeybindLabelRef,
  openedDocumentTabsRef,
  saveDocumentKeepEditModeKeybindLabelRef,
  saveDocumentKeybindLabelRef,
  showDeleteDocumentButtonRef,
  showDocumentControlBarRef,
  showDocumentTabsRef,
  showEditDocumentButtonRef,
  showSaveDocumentButtonsRef
} = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    activeDocumentTabNameRef: ref('doc-1'),
    editDocumentKeybindLabelRef: ref('Ctrl+E'),
    moveDocumentTabLeftKeybindLabelRef: ref('Ctrl+Left'),
    moveDocumentTabRightKeybindLabelRef: ref('Ctrl+Right'),
    openedDocumentTabsRef: ref<I_faOpenedDocumentTab[]>([]),
    saveDocumentKeepEditModeKeybindLabelRef: ref('Ctrl+Shift+S'),
    saveDocumentKeybindLabelRef: ref('Ctrl+S'),
    showDeleteDocumentButtonRef: ref(false),
    showDocumentControlBarRef: ref(true),
    showDocumentTabsRef: ref(false),
    showEditDocumentButtonRef: ref(false),
    showSaveDocumentButtonsRef: ref(false)
  }
})

vi.mock('../scripts/projectDocumentControlBar_manager', () => {
  return {
    FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR: '[data-test-locator="mainLayoutHeader"]',
    useProjectDocumentControlBar: () => {
      return {
        activeDocumentTabName: activeDocumentTabNameRef,
        editDocumentKeybindLabel: editDocumentKeybindLabelRef,
        moveDocumentTabLeftKeybindLabel: moveDocumentTabLeftKeybindLabelRef,
        moveDocumentTabRightKeybindLabel: moveDocumentTabRightKeybindLabelRef,
        onDeleteCurrentDocumentClick: controlBarHandlers.onDeleteCurrentDocumentClick,
        onEnterEditModeClick: controlBarHandlers.onEnterEditModeClick,
        onSaveDocumentClick: controlBarHandlers.onSaveDocumentClick,
        onTabAuxClick: controlBarHandlers.onTabAuxClick,
        onTabCloseAllWithoutChangesClick: controlBarHandlers.onTabCloseAllWithoutChangesClick,
        onTabCloseAllWithoutChangesExceptClick: controlBarHandlers.onTabCloseAllWithoutChangesExceptClick,
        onTabCloseClick: controlBarHandlers.onTabCloseClick,
        onTabCopyNameClick: controlBarHandlers.onTabCopyNameClick,
        onTabDeleteClick: controlBarHandlers.onTabDeleteClick,
        onTabForceCloseAllClick: controlBarHandlers.onTabForceCloseAllClick,
        onTabForceCloseAllExceptClick: controlBarHandlers.onTabForceCloseAllExceptClick,
        onTabMoveClick: controlBarHandlers.onTabMoveClick,
        openedDocumentTabs: openedDocumentTabsRef,
        resolveDocumentTabLabel: (tab: { displayNameDraft: string, tabLabel: string }) => {
          return tab.displayNameDraft.length > 0 ? tab.displayNameDraft : tab.tabLabel
        },
        resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
        saveDocumentButtonColor: 'primary-bright',
        saveDocumentKeepEditModeKeybindLabel: saveDocumentKeepEditModeKeybindLabelRef,
        saveDocumentKeybindLabel: saveDocumentKeybindLabelRef,
        showDeleteDocumentButton: showDeleteDocumentButtonRef,
        showDocumentControlBar: showDocumentControlBarRef,
        showDocumentTabs: showDocumentTabsRef,
        showEditDocumentButton: showEditDocumentButtonRef,
        showSaveDocumentButtons: showSaveDocumentButtonsRef
      }
    }
  }
})

import ProjectDocumentControlBar from '../ProjectDocumentControlBar.vue'

const sampleTab: I_faOpenedDocumentTab = {
  ...projectDocumentControlBarTabContextMenuSampleTab,
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE
}

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

async function createControlBarRouter () {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/home/document/:documentId',
        component: { template: '<div />' }
      }
    ]
  })
  await router.push('/home/document/doc-1')
  await router.isReady()
  return router
}

function mountControlBar () {
  return mount(ProjectDocumentControlBar, {
    global: {
      plugins: [testI18n],
      stubs: {
        DialogDeleteOpenedDocument: { template: '<div data-test-locator="dialogDeleteOpenedDocument-stub" />' },
        DialogDiscardOpenedDocumentTab: { template: '<div data-test-locator="dialogDiscardOpenedDocumentTab-stub" />' },
        ProjectDocumentControlBarTabContextMenu: {
          props: ['tab'],
          template: '<div data-test-locator="projectDocumentControlBar-tabContextMenu-stub" />'
        },
        QBtn: {
          emits: ['click'],
          template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
        },
        QRouteTab: {
          emits: ['auxclick'],
          props: ['name', 'label', 'to', 'alert', 'alertIcon'],
          template: `
            <div
              :data-test-locator="'projectDocumentControlBar-tab-' + name"
              @auxclick.stop.prevent="$emit('auxclick', $event)"
            >
              <slot />
            </div>
          `
        },
        QTabs: { template: '<div class="q-tabs-stub"><slot /></div>' },
        QTooltip: { template: '<div class="q-tooltip-stub"><slot /></div>' },
        TransitionGroup: { template: '<div class="transition-group-stub"><slot /></div>' }
      }
    }
  })
}

beforeEach(() => {
  document.body.innerHTML = '<div data-test-locator="mainLayoutHeader" class="appHeader__tabsRegion"></div>'
  showDocumentControlBarRef.value = true
  showDocumentTabsRef.value = false
  showEditDocumentButtonRef.value = false
  showSaveDocumentButtonsRef.value = false
  showDeleteDocumentButtonRef.value = false
  openedDocumentTabsRef.value = []
  activeDocumentTabNameRef.value = 'doc-1'
  vi.clearAllMocks()
})

afterEach(() => {
  document.body.innerHTML = ''
})

test('Test that ProjectDocumentControlBar renders when showDocumentControlBar is true', async () => {
  const wrapper = mountControlBar()
  await flushPromises()
  expect(document.querySelector('[data-test-locator="projectDocumentControlBar"]')).not.toBeNull()
  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar is hidden when showDocumentControlBar is false', () => {
  showDocumentControlBarRef.value = false
  const wrapper = mountControlBar()
  expect(wrapper.find('[data-test-locator="projectDocumentControlBar"]').exists()).toBe(false)
  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar teleports document tabs into the header mount region', async () => {
  showDocumentTabsRef.value = true
  openedDocumentTabsRef.value = [sampleTab]

  const router = await createControlBarRouter()
  const wrapper = mount(ProjectDocumentControlBar, {
    global: {
      plugins: [testI18n, router],
      stubs: {
        DialogDeleteOpenedDocument: true,
        DialogDiscardOpenedDocumentTab: true,
        ProjectDocumentControlBarTabContextMenu: {
          props: ['tab'],
          template: '<div :data-test-locator="\'projectDocumentControlBar-tabContextMenu-stub-\' + tab.documentId" />'
        },
        QBtn: true,
        QRouteTab: {
          emits: ['auxclick'],
          props: ['name'],
          template: '<div :data-test-locator="\'projectDocumentControlBar-tab-\' + name" @auxclick.stop.prevent="$emit(\'auxclick\', $event)"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' },
        QTooltip: true,
        TransitionGroup: { template: '<div><slot /></div>' }
      }
    }
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-tab-doc-1"]')).not.toBeNull()
  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-tabContextMenu-stub-doc-1"]')).not.toBeNull()

  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar wires tab close and aux interactions', async () => {
  showDocumentTabsRef.value = true
  openedDocumentTabsRef.value = [sampleTab]

  const router = await createControlBarRouter()
  const wrapper = mount(ProjectDocumentControlBar, {
    global: {
      plugins: [testI18n, router],
      stubs: {
        DialogDeleteOpenedDocument: true,
        DialogDiscardOpenedDocumentTab: true,
        ProjectDocumentControlBarTabContextMenu: {
          props: ['tab'],
          template: '<div :data-test-locator="\'projectDocumentControlBar-tabContextMenu-stub-\' + tab.documentId" />'
        },
        QBtn: {
          emits: ['click'],
          template: '<button type="button" v-bind="$attrs" @click.stop.prevent="$emit(\'click\', $event)" />'
        },
        QRouteTab: {
          emits: ['auxclick'],
          props: ['name'],
          template: '<div :data-test-locator="\'projectDocumentControlBar-tab-\' + name" @auxclick.stop.prevent="$emit(\'auxclick\', $event)"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' },
        QTooltip: true,
        TransitionGroup: { template: '<div><slot /></div>' }
      }
    }
  })

  await flushPromises()

  const tab = new DOMWrapper(document.querySelector('[data-test-locator="projectDocumentControlBar-tab-doc-1"]')!)
  await tab.trigger('auxclick', { button: 1 })
  expect(controlBarHandlers.onTabAuxClick).toHaveBeenCalledWith('doc-1', expect.any(Event))

  const closeButton = new DOMWrapper(document.querySelector('[data-test-locator="projectDocumentControlBar-tabClose-doc-1"]')!)
  await closeButton.trigger('click')
  expect(controlBarHandlers.onTabCloseClick).toHaveBeenCalledWith('doc-1')

  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar action buttons call manager handlers', async () => {
  showEditDocumentButtonRef.value = true
  showSaveDocumentButtonsRef.value = true
  showDeleteDocumentButtonRef.value = true

  const wrapper = mountControlBar()
  await flushPromises()

  await new DOMWrapper(document.querySelector('[data-test-locator="projectDocumentControlBar-editDocumentButton"]')!).trigger('click')
  await new DOMWrapper(document.querySelector('[data-test-locator="projectDocumentControlBar-saveDocumentKeepEditModeButton"]')!).trigger('click')
  await new DOMWrapper(document.querySelector('[data-test-locator="projectDocumentControlBar-saveDocumentButton"]')!).trigger('click')
  await new DOMWrapper(document.querySelector('[data-test-locator="projectDocumentControlBar-deleteDocumentButton"]')!).trigger('click')

  expect(controlBarHandlers.onEnterEditModeClick).toHaveBeenCalled()
  expect(controlBarHandlers.onSaveDocumentClick).toHaveBeenCalledWith(true)
  expect(controlBarHandlers.onSaveDocumentClick).toHaveBeenCalledWith(false)
  expect(controlBarHandlers.onDeleteCurrentDocumentClick).toHaveBeenCalled()

  wrapper.unmount()
})
