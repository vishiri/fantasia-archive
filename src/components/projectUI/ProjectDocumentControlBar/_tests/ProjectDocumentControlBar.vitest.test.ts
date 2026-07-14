/** @vitest-environment jsdom */
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import type { CSSProperties } from 'vue'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
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
  onTabCopyBackgroundColorClick: vi.fn(async () => undefined),
  onTabCopyNameClick: vi.fn(async () => undefined),
  onTabCopyTextColorClick: vi.fn(async () => undefined),
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
  resolveTabWorldIndicatorColorRef,
  resolveDocumentTabAppearanceChromeRef,
  resolveDocumentTabInlineStyleRef,
  saveDocumentKeepEditModeKeybindLabelRef,
  saveDocumentKeybindLabelRef,
  showDeleteDocumentButtonRef,
  showDocumentControlBarRef,
  showDocumentTabsRef,
  showEditDocumentButtonRef,
  showSaveDocumentButtonsRef,
  showWorldTabIndicatorsRef
} = vi.hoisted(() => {
  const { ref } = require('vue') as typeof import('vue')
  return {
    activeDocumentTabNameRef: ref('doc-1'),
    editDocumentKeybindLabelRef: ref('Ctrl+E'),
    moveDocumentTabLeftKeybindLabelRef: ref('Ctrl+Left'),
    moveDocumentTabRightKeybindLabelRef: ref('Ctrl+Right'),
    openedDocumentTabsRef: ref<I_faOpenedDocumentTab[]>([]),
    resolveTabWorldIndicatorColorRef: ref<(tab: I_faOpenedDocumentTab) => string | null>(() => null),
    resolveDocumentTabAppearanceChromeRef: ref<(tab: I_faOpenedDocumentTab) => I_faDocumentAppearanceChromeStyle | undefined>(() => undefined),
    resolveDocumentTabInlineStyleRef: ref<(tab: I_faOpenedDocumentTab) => CSSProperties | undefined>(() => undefined),
    saveDocumentKeepEditModeKeybindLabelRef: ref('Ctrl+Shift+S'),
    saveDocumentKeybindLabelRef: ref('Ctrl+S'),
    showDeleteDocumentButtonRef: ref(false),
    showDocumentControlBarRef: ref(true),
    showDocumentTabsRef: ref(false),
    showEditDocumentButtonRef: ref(false),
    showSaveDocumentButtonsRef: ref(false),
    showWorldTabIndicatorsRef: ref(false)
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
        onTabCopyBackgroundColorClick: controlBarHandlers.onTabCopyBackgroundColorClick,
        onTabCopyNameClick: controlBarHandlers.onTabCopyNameClick,
        onTabCopyTextColorClick: controlBarHandlers.onTabCopyTextColorClick,
        onTabDeleteClick: controlBarHandlers.onTabDeleteClick,
        onTabForceCloseAllClick: controlBarHandlers.onTabForceCloseAllClick,
        onTabForceCloseAllExceptClick: controlBarHandlers.onTabForceCloseAllExceptClick,
        onTabMoveClick: controlBarHandlers.onTabMoveClick,
        openedDocumentTabs: openedDocumentTabsRef,
        resolveDocumentTabLabel: (tab: { displayNameDraft: string, tabLabel: string }) => {
          return tab.displayNameDraft.length > 0 ? tab.displayNameDraft : tab.tabLabel
        },
        resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
        resolveDocumentTabAppearanceChrome: (tab: I_faOpenedDocumentTab) => {
          return resolveDocumentTabAppearanceChromeRef.value(tab)
        },
        resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => {
          return resolveDocumentTabInlineStyleRef.value(tab)
        },
        resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => {
          return resolveTabWorldIndicatorColorRef.value(tab)
        },
        saveDocumentButtonColor: 'primary-bright',
        saveDocumentKeepEditModeKeybindLabel: saveDocumentKeepEditModeKeybindLabelRef,
        saveDocumentKeybindLabel: saveDocumentKeybindLabelRef,
        showDeleteDocumentButton: showDeleteDocumentButtonRef,
        showDocumentControlBar: showDocumentControlBarRef,
        showDocumentTabs: showDocumentTabsRef,
        showEditDocumentButton: showEditDocumentButtonRef,
        showSaveDocumentButtons: showSaveDocumentButtonsRef,
        showWorldTabIndicators: showWorldTabIndicatorsRef
      }
    }
  }
})

import ProjectDocumentControlBar from '../ProjectDocumentControlBar.vue'
import {
  resolveProjectDocumentControlBarTabAppearanceChrome,
  resolveProjectDocumentControlBarTabInlineStyle
} from '../scripts/projectDocumentControlBarTabAppearanceChromeWiring'
import { expectCssColorValue } from 'app/helpers/vitestCssColorExpect'

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
  showWorldTabIndicatorsRef.value = false
  resolveTabWorldIndicatorColorRef.value = () => null
  resolveDocumentTabAppearanceChromeRef.value = () => undefined
  resolveDocumentTabInlineStyleRef.value = () => undefined
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

test('Test that ProjectDocumentControlBar applies document appearance styles to tabs', async () => {
  showDocumentTabsRef.value = true
  openedDocumentTabsRef.value = [{
    ...sampleTab,
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#aabbcc'
  }]
  resolveDocumentTabAppearanceChromeRef.value = resolveProjectDocumentControlBarTabAppearanceChrome
  resolveDocumentTabInlineStyleRef.value = resolveProjectDocumentControlBarTabInlineStyle

  const router = await createControlBarRouter()
  const wrapper = mount(ProjectDocumentControlBar, {
    global: {
      plugins: [testI18n, router],
      stubs: {
        DialogDeleteOpenedDocument: true,
        DialogDiscardOpenedDocumentTab: true,
        ProjectDocumentControlBarTabContextMenu: true,
        QBtn: true,
        QRouteTab: {
          props: ['name', 'style'],
          template: '<div :class="$attrs.class" :data-test-locator="\'projectDocumentControlBar-tab-\' + name" :style="style"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' },
        QTooltip: true,
        TransitionGroup: { template: '<div><slot /></div>' }
      }
    }
  })

  await flushPromises()

  const tab = document.querySelector('[data-test-locator="projectDocumentControlBar-tab-doc-1"]') as HTMLElement
  expect(tab).not.toBeNull()
  expect(tab.classList.contains('projectDocumentControlBarTabs__tab--customAppearance')).toBe(true)
  expect(tab.style.color).toBe('')
  expectCssColorValue(tab.style.backgroundColor, '#112233')
  expect(tab.style.getPropertyValue('--projectDocumentControlBarTab-textColor').trim()).toBe('#aabbcc')
  expect(tab.style.getPropertyValue('--projectDocumentControlBarTab-focusHelperColor').trim()).toBe('#112233')

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

test('Test that ProjectDocumentControlBar renders world globe indicators for multi-world tabs', async () => {
  showDocumentTabsRef.value = true
  showWorldTabIndicatorsRef.value = true
  resolveTabWorldIndicatorColorRef.value = (tab) => {
    return tab.worldId === 'world-2' ? '#ff00ff' : null
  }
  openedDocumentTabsRef.value = [{
    ...sampleTab,
    worldId: 'world-2'
  }]

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
        ProjectDocumentControlBarTabWorldIndicator: {
          props: ['color', 'documentId', 'visible'],
          template: '<i v-if="visible && color" :data-test-locator="\'projectDocumentControlBar-tabWorldIndicator-\' + documentId" :style="{ color }" />'
        },
        QBtn: true,
        QIcon: {
          props: ['name', 'style'],
          template: '<i :data-test-locator="$attrs[\'data-test-locator\']" :style="style" />'
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

  const globe = document.querySelector('[data-test-locator="projectDocumentControlBar-tabWorldIndicator-doc-1"]')
  expect(globe).not.toBeNull()
  expect((globe as HTMLElement).style.color).toBe('rgb(255, 0, 255)')

  wrapper.unmount()
})

test('Test that ProjectDocumentControlBar hides world globe indicators when disabled', async () => {
  showDocumentTabsRef.value = true
  showWorldTabIndicatorsRef.value = false
  resolveTabWorldIndicatorColorRef.value = () => '#ff00ff'
  openedDocumentTabsRef.value = [{
    ...sampleTab,
    worldId: 'world-2'
  }]

  const router = await createControlBarRouter()
  const wrapper = mount(ProjectDocumentControlBar, {
    global: {
      plugins: [testI18n, router],
      stubs: {
        DialogDeleteOpenedDocument: true,
        DialogDiscardOpenedDocumentTab: true,
        ProjectDocumentControlBarTabContextMenu: true,
        ProjectDocumentControlBarTabWorldIndicator: true,
        QBtn: true,
        QRouteTab: {
          props: ['name'],
          template: '<div :data-test-locator="\'projectDocumentControlBar-tab-\' + name"><slot /></div>'
        },
        QTabs: { template: '<div><slot /></div>' },
        QTooltip: true,
        TransitionGroup: { template: '<div><slot /></div>' }
      }
    }
  })

  await flushPromises()

  expect(document.querySelector('[data-test-locator="projectDocumentControlBar-tabWorldIndicator-doc-1"]')).toBeNull()

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
