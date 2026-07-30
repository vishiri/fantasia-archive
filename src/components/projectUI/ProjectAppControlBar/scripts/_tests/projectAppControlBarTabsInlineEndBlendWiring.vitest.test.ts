/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { Ref } from 'vue'
import { afterEach, expect, test, vi } from 'vitest'

import { useProjectAppControlBarTabsInlineEndBlend } from '../projectAppControlBarTabsInlineEndBlendWiring'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

function createOverflowTabsContent (): HTMLElement {
  const content = document.createElement('div')
  content.className = 'q-tabs__content'
  Object.defineProperty(content, 'clientWidth', {
    configurable: true,
    get: () => 100
  })
  Object.defineProperty(content, 'scrollWidth', {
    configurable: true,
    get: () => 300
  })
  content.scrollLeft = 0
  return content
}

function mountBlendHost (input: {
  tabsRootRef: Ref<HTMLElement | null>
  watchSource: () => unknown
}): {
    tabsScrolledToInlineEnd: Ref<boolean>
    unmount: () => void
  } {
  let blendApi: ReturnType<typeof useProjectAppControlBarTabsInlineEndBlend> | undefined
  const Host = defineComponent({
    name: 'TabsInlineEndBlendHost',
    setup () {
      blendApi = useProjectAppControlBarTabsInlineEndBlend({
        tabsRootRef: input.tabsRootRef,
        watchSource: input.watchSource
      })
      return () => h('div')
    }
  })
  const wrapper = mount(Host)
  if (blendApi === undefined) {
    throw new Error('blendApi missing')
  }
  return {
    tabsScrolledToInlineEnd: blendApi.tabsScrolledToInlineEnd,
    unmount: () => {
      wrapper.unmount()
    }
  }
}

/**
 * useProjectAppControlBarTabsInlineEndBlend
 * Scroll listener marks inline end when content is fully scrolled right.
 */
test('Test that useProjectAppControlBarTabsInlineEndBlend hides blend at scroll end', async () => {
  const content = createOverflowTabsContent()
  const root = document.createElement('div')
  root.appendChild(content)
  document.body.appendChild(root)

  const tabsRootRef = ref<HTMLElement | null>(root)
  const { tabsScrolledToInlineEnd, unmount } = mountBlendHost({
    tabsRootRef,
    watchSource: () => {
      return 0
    }
  })
  await nextTick()
  await nextTick()

  expect(tabsScrolledToInlineEnd.value).toBe(false)

  content.scrollLeft = 200
  content.dispatchEvent(new Event('scroll'))
  expect(tabsScrolledToInlineEnd.value).toBe(true)

  unmount()
})

/**
 * useProjectAppControlBarTabsInlineEndBlend
 * Missing .q-tabs__content treats strip as already at inline end.
 */
test('Test that useProjectAppControlBarTabsInlineEndBlend treats missing content as at end', async () => {
  const root = document.createElement('div')
  document.body.appendChild(root)
  const tabsRootRef = ref<HTMLElement | null>(root)
  const { tabsScrolledToInlineEnd, unmount } = mountBlendHost({
    tabsRootRef,
    watchSource: () => {
      return 0
    }
  })
  await nextTick()
  await nextTick()

  expect(tabsScrolledToInlineEnd.value).toBe(true)
  unmount()
})

/**
 * useProjectAppControlBarTabsInlineEndBlend
 * Null tabs root clears attach and marks scrolled to end.
 */
test('Test that useProjectAppControlBarTabsInlineEndBlend treats null root as at end', async () => {
  const content = createOverflowTabsContent()
  const root = document.createElement('div')
  root.appendChild(content)
  document.body.appendChild(root)

  const tabsRootRef = ref<HTMLElement | null>(root)
  const { tabsScrolledToInlineEnd, unmount } = mountBlendHost({
    tabsRootRef,
    watchSource: () => {
      return 0
    }
  })
  await nextTick()
  await nextTick()
  expect(tabsScrolledToInlineEnd.value).toBe(false)

  tabsRootRef.value = null
  await nextTick()
  await nextTick()
  expect(tabsScrolledToInlineEnd.value).toBe(true)

  unmount()
})

/**
 * useProjectAppControlBarTabsInlineEndBlend
 * watchSource and MutationObserver re-sync scroll-end state after DOM/list changes.
 */
test('Test that useProjectAppControlBarTabsInlineEndBlend re-syncs on watchSource and mutations', async () => {
  const content = createOverflowTabsContent()
  const root = document.createElement('div')
  root.appendChild(content)
  document.body.appendChild(root)

  const tabCount = ref(1)
  const tabsRootRef = ref<HTMLElement | null>(root)
  const { tabsScrolledToInlineEnd, unmount } = mountBlendHost({
    tabsRootRef,
    watchSource: () => {
      return tabCount.value
    }
  })
  await nextTick()
  await nextTick()
  expect(tabsScrolledToInlineEnd.value).toBe(false)

  content.scrollLeft = 200
  tabCount.value = 2
  await nextTick()
  await nextTick()
  expect(tabsScrolledToInlineEnd.value).toBe(true)

  content.scrollLeft = 0
  content.appendChild(document.createElement('span'))
  await nextTick()
  await nextTick()
  expect(tabsScrolledToInlineEnd.value).toBe(false)

  unmount()
})

/**
 * useProjectAppControlBarTabsInlineEndBlend
 * ResizeObserver callback re-syncs when content box changes.
 */
test('Test that useProjectAppControlBarTabsInlineEndBlend re-syncs on ResizeObserver', async () => {
  const resizeCallbacks: Array<() => void> = []
  class FakeResizeObserver {
    constructor (callback: () => void) {
      resizeCallbacks.push(callback)
    }

    observe (): void {}

    disconnect (): void {}

    unobserve (): void {}
  }
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)

  const content = createOverflowTabsContent()
  const root = document.createElement('div')
  root.appendChild(content)
  document.body.appendChild(root)

  const tabsRootRef = ref<HTMLElement | null>(root)
  const { tabsScrolledToInlineEnd, unmount } = mountBlendHost({
    tabsRootRef,
    watchSource: () => {
      return 0
    }
  })
  await nextTick()
  await nextTick()
  expect(tabsScrolledToInlineEnd.value).toBe(false)

  content.scrollLeft = 200
  expect(resizeCallbacks.length).toBeGreaterThan(0)
  resizeCallbacks[0]?.()
  expect(tabsScrolledToInlineEnd.value).toBe(true)

  unmount()
})
