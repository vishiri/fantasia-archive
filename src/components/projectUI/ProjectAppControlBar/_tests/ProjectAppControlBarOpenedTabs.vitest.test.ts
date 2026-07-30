/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import { projectAppControlBarTabContextMenuSampleTab } from './projectAppControlBarTabContextMenuListVitestMount'

const {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor,
  hideNativeSortableDragGhost,
  onProjectAppControlBarTabsWheel,
  startProjectAppControlBarTabsDragEdgeScroll,
  stopProjectAppControlBarTabsDragEdgeScroll,
  sortableTabsRef,
  onTabsDragEnd
} = vi.hoisted(() => {
  const { ref: vueRef } = require('vue') as typeof import('vue')
  return {
    applyFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    clearFaVerticalDraggableTabsDocumentDragCursor: vi.fn(),
    hideNativeSortableDragGhost: vi.fn(),
    onProjectAppControlBarTabsWheel: vi.fn(),
    startProjectAppControlBarTabsDragEdgeScroll: vi.fn(),
    stopProjectAppControlBarTabsDragEdgeScroll: vi.fn(),
    sortableTabsRef: vueRef<I_faOpenedDocumentTab[]>([]),
    onTabsDragEnd: vi.fn()
  }
})

vi.mock('../scripts/projectAppControlBar_manager', () => {
  const VueDraggable = defineComponent({
    name: 'VueDraggable',
    props: {
      animation: {
        type: Number,
        default: 0
      },
      modelValue: {
        type: Array,
        default: () => []
      },
      setData: {
        type: Function,
        default: undefined
      },
      touchStartThreshold: {
        type: Number,
        default: 0
      }
    },
    emits: ['update:modelValue', 'start', 'end'],
    setup (props, { emit, slots, expose }) {
      const dataTransfer = {
        setDragImage: vi.fn()
      } as unknown as DataTransfer
      const { onMounted } = require('vue') as typeof import('vue')
      onMounted(() => {
        if (typeof props.setData === 'function') {
          props.setData(dataTransfer)
        }
        // Exercise parent v-model write path (sortableTabs setter).
        emit('update:modelValue', Array.isArray(props.modelValue) ? [...props.modelValue] : [])
      })
      expose({
        emitStart: (event: unknown) => {
          emit('start', event)
        },
        emitEnd: (event: unknown) => {
          emit('end', event)
        }
      })
      return () => h('div', {
        class: 'vue-draggable-stub',
        'data-test-locator': 'openedTabs-vueDraggable'
      }, slots.default?.())
    }
  })

  return {
    FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR: '[data-test-locator="mainLayoutHeader"]',
    PROJECT_APP_CONTROL_BAR_TABS_SORTABLE_ANIMATION_MS: 150,
    VueDraggable,
    applyFaVerticalDraggableTabsDocumentDragCursor,
    clearFaVerticalDraggableTabsDocumentDragCursor,
    hideNativeSortableDragGhost,
    onProjectAppControlBarTabsWheel,
    projectAppControlBarTabsSortableDragOptions: {
      direction: 'horizontal',
      filter: '.projectAppControlBarTabs__tabClose',
      preventOnFilter: true
    },
    startProjectAppControlBarTabsDragEdgeScroll,
    stopProjectAppControlBarTabsDragEdgeScroll,
    useProjectAppControlBarTabsInlineEndBlend: (input: {
      watchSource: () => unknown
    }) => {
      const { ref: vueRef } = require('vue') as typeof import('vue')
      input.watchSource()
      return {
        tabsScrolledToInlineEnd: vueRef(false)
      }
    },
    useProjectAppControlBarOpenedTabsSortable: (input: {
      getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
      onTabReorder: (fromIndex: number, toIndex: number) => void
    }) => {
      sortableTabsRef.value = input.getOpenedDocumentTabs().map((tab) => {
        return { ...tab }
      })
      return {
        onTabsDragEnd: (event: { newIndex?: number, oldIndex?: number }) => {
          onTabsDragEnd(event)
          const { oldIndex, newIndex } = event
          if (
            oldIndex === undefined ||
            newIndex === undefined ||
            oldIndex === newIndex
          ) {
            return
          }
          input.onTabReorder(oldIndex, newIndex)
        },
        sortableTabs: sortableTabsRef
      }
    }
  }
})

import ProjectAppControlBarOpenedTabs from '../ProjectAppControlBarOpenedTabs.vue'

const sampleTab: I_faOpenedDocumentTab = {
  ...projectAppControlBarTabContextMenuSampleTab,
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE
}

const handlers = {
  onTabAddNewDocumentUnderThisClick: vi.fn(async () => undefined),
  onTabAuxClick: vi.fn(),
  onTabCloseAllWithoutChangesClick: vi.fn(),
  onTabCloseAllWithoutChangesExceptClick: vi.fn(),
  onTabCloseClick: vi.fn(),
  onTabCopyBackgroundColorClick: vi.fn(async () => undefined),
  onTabCopyDocumentClick: vi.fn(async () => undefined),
  onTabCopyNameClick: vi.fn(async () => undefined),
  onTabCopyTextColorClick: vi.fn(async () => undefined),
  onTabDeleteClick: vi.fn(),
  onTabForceCloseAllClick: vi.fn(),
  onTabForceCloseAllExceptClick: vi.fn(),
  onTabMoveClick: vi.fn(),
  onTabReorder: vi.fn()
}

beforeEach(() => {
  document.body.innerHTML = '<div data-test-locator="mainLayoutHeader"></div>'
  sortableTabsRef.value = [sampleTab]
  vi.clearAllMocks()
})

afterEach(() => {
  document.body.innerHTML = ''
})

async function mountOpenedTabs (input?: {
  hideTabCloseButton?: boolean
  resolveDocumentTabAppearanceChrome?: (tab: I_faOpenedDocumentTab) => { backgroundColor?: string, color?: string } | undefined
  resolveTabWorldIndicatorColor?: (tab: I_faOpenedDocumentTab) => string | null
  showTabBarScrollButtons?: boolean
  showWorldTabIndicators?: boolean
  tabs?: I_faOpenedDocumentTab[]
}) {
  const tabs = input?.tabs ?? [sampleTab]
  sortableTabsRef.value = tabs
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

  return mount(ProjectAppControlBarOpenedTabs, {
    props: {
      activeDocumentTabName: 'doc-1',
      hideTabCloseButton: input?.hideTabCloseButton === true,
      moveDocumentTabLeftKeybindLabel: null,
      moveDocumentTabRightKeybindLabel: null,
      ...handlers,
      openedDocumentTabs: tabs,
      resolveDocumentTabAppearanceChrome: input?.resolveDocumentTabAppearanceChrome ?? (() => undefined),
      resolveDocumentTabDisplayIcon: (tab) => tab.templateIcon,
      resolveDocumentTabInlineStyle: () => undefined,
      resolveDocumentTabLabel: (tab) => tab.displayNameDraft,
      resolveDocumentTabRoute: (documentId) => `/home/document/${documentId}`,
      resolveTabWorldIndicatorColor: input?.resolveTabWorldIndicatorColor ?? (() => null),
      showDocumentTabs: true,
      showTabBarScrollButtons: input?.showTabBarScrollButtons === true,
      showWorldTabIndicators: input?.showWorldTabIndicators === true
    },
    global: {
      plugins: [router],
      stubs: {
        ProjectAppControlBarTabContextMenu: true,
        ProjectAppControlBarTabWorldIndicator: true,
        QBtn: true,
        QRouteTab: {
          props: ['name', 'to', 'icon'],
          template: '<div :data-test-locator="\'projectAppControlBar-tab-\' + name" :class="$attrs.class" :draggable="$attrs.draggable"><slot /></div>'
        },
        QTabs: { template: '<div class="q-tabs"><div class="q-tabs__content"><slot /></div></div>' }
      }
    },
    attachTo: document.body
  })
}

test('Test that ProjectAppControlBarOpenedTabs hides when showDocumentTabs is false', async () => {
  document.body.innerHTML = '<div data-test-locator="mainLayoutHeader"></div>'
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

  const wrapper = mount(ProjectAppControlBarOpenedTabs, {
    props: {
      activeDocumentTabName: 'doc-1',
      hideTabCloseButton: false,
      moveDocumentTabLeftKeybindLabel: null,
      moveDocumentTabRightKeybindLabel: null,
      ...handlers,
      openedDocumentTabs: [sampleTab],
      resolveDocumentTabAppearanceChrome: () => undefined,
      resolveDocumentTabDisplayIcon: (tab) => tab.templateIcon,
      resolveDocumentTabInlineStyle: () => undefined,
      resolveDocumentTabLabel: (tab) => tab.displayNameDraft,
      resolveDocumentTabRoute: (documentId) => `/home/document/${documentId}`,
      resolveTabWorldIndicatorColor: () => null,
      showDocumentTabs: false,
      showTabBarScrollButtons: false,
      showWorldTabIndicators: false
    },
    global: {
      plugins: [router],
      stubs: {
        ProjectAppControlBarTabContextMenu: true,
        ProjectAppControlBarTabWorldIndicator: true,
        QBtn: true,
        QRouteTab: true,
        QTabs: true
      }
    },
    attachTo: document.body
  })
  await flushPromises()

  expect(document.querySelector('.projectAppControlBarTabs')).toBeNull()
  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs teleports tabs and disables native drag', async () => {
  const wrapper = await mountOpenedTabs()
  await flushPromises()

  const tab = document.querySelector('[data-test-locator="projectAppControlBar-tab-doc-1"]')
  expect(tab).not.toBeNull()
  expect(tab?.getAttribute('draggable')).toBe('false')

  wrapper.unmount()
  expect(stopProjectAppControlBarTabsDragEdgeScroll).toHaveBeenCalled()
})

test('Test that ProjectAppControlBarOpenedTabs starts and stops drag edge scroll on Sortable events', async () => {
  const wrapper = await mountOpenedTabs()
  await flushPromises()

  const draggable = wrapper.findComponent({ name: 'VueDraggable' })
  expect(draggable.exists()).toBe(true)

  await draggable.vm.$emit('start', {
    originalEvent: new MouseEvent('mousedown', {
      clientX: 120
    })
  })
  expect(applyFaVerticalDraggableTabsDocumentDragCursor).toHaveBeenCalled()
  expect(startProjectAppControlBarTabsDragEdgeScroll).toHaveBeenCalled()

  await draggable.vm.$emit('end', {
    oldIndex: 0,
    newIndex: 1
  })
  expect(stopProjectAppControlBarTabsDragEdgeScroll).toHaveBeenCalled()
  expect(clearFaVerticalDraggableTabsDocumentDragCursor).toHaveBeenCalled()
  expect(onTabsDragEnd).toHaveBeenCalledWith({
    oldIndex: 0,
    newIndex: 1
  })
  expect(handlers.onTabReorder).toHaveBeenCalledWith(0, 1)
  expect(hideNativeSortableDragGhost).toHaveBeenCalled()

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs maps wheel to manager handler', async () => {
  const wrapper = await mountOpenedTabs()
  await flushPromises()

  const root = document.querySelector('.projectAppControlBarTabs')
  expect(root).not.toBeNull()
  root?.dispatchEvent(new WheelEvent('wheel', {
    deltaY: 40,
    bubbles: true
  }))
  await nextTick()
  expect(onProjectAppControlBarTabsWheel).toHaveBeenCalled()

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs close button calls onTabCloseClick', async () => {
  const wrapper = await mountOpenedTabs()
  await flushPromises()

  const closeButton = document.querySelector('[data-test-locator="projectAppControlBar-tabClose-doc-1"]')
  expect(closeButton).not.toBeNull()
  closeButton?.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true
  }))
  await nextTick()
  expect(handlers.onTabCloseClick).toHaveBeenCalledWith('doc-1')

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs hides close button when hideTabCloseButton is on', async () => {
  const wrapper = await mountOpenedTabs({
    hideTabCloseButton: true
  })
  await flushPromises()

  expect(
    document.querySelector('[data-test-locator="projectAppControlBar-tabClose-doc-1"]')
  ).toBeNull()

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs toggles scroll-button modifier class', async () => {
  const hidden = await mountOpenedTabs()
  await flushPromises()
  expect(
    document.querySelector('.projectAppControlBarTabs--showScrollButtons')
  ).toBeNull()
  expect(
    document.querySelector('.projectAppControlBarTabs--scrolledToInlineEnd')
  ).toBeNull()
  hidden.unmount()

  const shown = await mountOpenedTabs({
    showTabBarScrollButtons: true
  })
  await flushPromises()
  expect(
    document.querySelector('.projectAppControlBarTabs--showScrollButtons')
  ).not.toBeNull()
  shown.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs maps auxclick to onTabAuxClick', async () => {
  const wrapper = await mountOpenedTabs()
  await flushPromises()

  const tab = document.querySelector('[data-test-locator="projectAppControlBar-tab-doc-1"]')
  expect(tab).not.toBeNull()
  tab?.dispatchEvent(new MouseEvent('auxclick', {
    bubbles: true,
    button: 1,
    cancelable: true
  }))
  await nextTick()
  expect(handlers.onTabAuxClick).toHaveBeenCalledWith('doc-1', expect.any(MouseEvent))

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs drag start accepts pointer originalEvent', async () => {
  const wrapper = await mountOpenedTabs()
  await flushPromises()

  const draggable = wrapper.findComponent({ name: 'VueDraggable' })
  await draggable.vm.$emit('start', {
    originalEvent: new PointerEvent('pointerdown', {
      clientX: 88
    })
  })
  expect(startProjectAppControlBarTabsDragEdgeScroll.mock.calls[0]?.[1]).toBe(88)

  await draggable.vm.$emit('start', {
    originalEvent: {}
  })
  expect(startProjectAppControlBarTabsDragEdgeScroll).toHaveBeenCalled()

  await draggable.vm.$emit('start', null)
  expect(startProjectAppControlBarTabsDragEdgeScroll).toHaveBeenCalled()

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs applies appearance and world-indicator classes', async () => {
  const chromeTab: I_faOpenedDocumentTab = {
    ...sampleTab,
    documentBackgroundColorDraft: '#112233',
    documentTextColorDraft: '#abcdef',
    hasUnsavedChanges: true
  }
  const wrapper = await mountOpenedTabs({
    resolveDocumentTabAppearanceChrome: () => ({
      backgroundColor: '#112233',
      color: '#abcdef'
    }),
    resolveTabWorldIndicatorColor: () => '#ff00aa',
    showWorldTabIndicators: true,
    tabs: [chromeTab]
  })
  await flushPromises()

  const tab = document.querySelector('[data-test-locator="projectAppControlBar-tab-doc-1"]')
  expect(tab?.className).toContain('projectAppControlBarTabs__tab--customAppearance')
  expect(tab?.className).toContain('projectAppControlBarTabs__tab--customDocumentBackground')
  expect(tab?.className).toContain('projectAppControlBarTabs__tab--withUnsavedAlert')
  expect(tab?.className).toContain('projectAppControlBarTabs__tab--withWorldIndicator')

  wrapper.unmount()
})

test('Test that ProjectAppControlBarOpenedTabs renders finished and dead markers', async () => {
  const markedTab: I_faOpenedDocumentTab = {
    ...sampleTab,
    displayNameDraft: 'Marked',
    isDeadDraft: true,
    isFinishedDraft: true
  }
  const wrapper = await mountOpenedTabs({
    tabs: [markedTab]
  })
  await flushPromises()

  expect(document.querySelector('.projectAppControlBarTabs__finishedMarker')?.textContent).toBe('✓')
  expect(document.querySelector('.projectAppControlBarTabs__deadMarker')?.textContent).toBe('†')
  expect(document.querySelector('.projectAppControlBarTabs__tabLabelText--dead')).not.toBeNull()

  wrapper.unmount()
})
