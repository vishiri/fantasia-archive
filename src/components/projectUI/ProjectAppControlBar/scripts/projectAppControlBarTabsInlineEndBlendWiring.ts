import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from 'vue'
import type { Ref } from 'vue'

import { resolveProjectAppControlBarTabsIsScrolledToInlineEnd } from '../functions/projectAppControlBarTabsWheelScroll'
import { PROJECT_APP_CONTROL_BAR_TABS_CONTENT_SELECTOR } from './projectAppControlBarTabsWheelScrollWiring'

type T_tabsInlineEndBlendSession = {
  contentEl: HTMLElement | null
  mutationObserver: MutationObserver | null
  onScroll: (() => void) | null
  resizeObserver: ResizeObserver | null
  setScrolledToInlineEnd: (value: boolean) => void
}

function syncTabsInlineEndBlendFromContent (session: T_tabsInlineEndBlendSession): void {
  if (session.contentEl === null) {
    session.setScrolledToInlineEnd(true)
    return
  }
  session.setScrolledToInlineEnd(resolveProjectAppControlBarTabsIsScrolledToInlineEnd({
    clientWidth: session.contentEl.clientWidth,
    scrollLeft: session.contentEl.scrollLeft,
    scrollWidth: session.contentEl.scrollWidth
  }))
}

function detachTabsInlineEndBlendContent (session: T_tabsInlineEndBlendSession): void {
  if (session.contentEl !== null && session.onScroll !== null) {
    session.contentEl.removeEventListener('scroll', session.onScroll)
  }
  session.resizeObserver?.disconnect()
  session.mutationObserver?.disconnect()
  session.mutationObserver = null
  session.onScroll = null
  session.resizeObserver = null
  session.contentEl = null
}

function attachTabsInlineEndBlendToRoot (
  session: T_tabsInlineEndBlendSession,
  root: HTMLElement | null
): void {
  detachTabsInlineEndBlendContent(session)
  if (root === null) {
    session.setScrolledToInlineEnd(true)
    return
  }
  const content = root.querySelector(PROJECT_APP_CONTROL_BAR_TABS_CONTENT_SELECTOR)
  if (!(content instanceof HTMLElement)) {
    session.setScrolledToInlineEnd(true)
    return
  }
  session.contentEl = content
  const onScroll = (): void => {
    syncTabsInlineEndBlendFromContent(session)
  }
  session.onScroll = onScroll
  content.addEventListener('scroll', onScroll, { passive: true })
  session.resizeObserver = new ResizeObserver(() => {
    syncTabsInlineEndBlendFromContent(session)
  })
  session.resizeObserver.observe(content)
  session.mutationObserver = new MutationObserver(() => {
    syncTabsInlineEndBlendFromContent(session)
  })
  session.mutationObserver.observe(content, {
    childList: true,
    subtree: true
  })
  syncTabsInlineEndBlendFromContent(session)
}

/**
 * Tracks whether header tab overflow is scrolled to the inline end so the
 * right-edge header blend overlay can hide when nothing is clipped.
 */
export function useProjectAppControlBarTabsInlineEndBlend (input: {
  tabsRootRef: Ref<HTMLElement | null>
  watchSource: () => unknown
}): {
    tabsScrolledToInlineEnd: Ref<boolean>
  } {
  const tabsScrolledToInlineEnd = ref(true)
  const session: T_tabsInlineEndBlendSession = {
    contentEl: null,
    mutationObserver: null,
    onScroll: null,
    resizeObserver: null,
    setScrolledToInlineEnd: (value) => {
      tabsScrolledToInlineEnd.value = value
    }
  }

  function attachFromTabsRootRef (): void {
    void nextTick(() => {
      attachTabsInlineEndBlendToRoot(session, input.tabsRootRef.value)
    })
  }

  onMounted(() => {
    attachFromTabsRootRef()
  })

  watch(
    () => input.tabsRootRef.value,
    () => {
      attachFromTabsRootRef()
    }
  )

  watch(
    input.watchSource,
    () => {
      void nextTick(() => {
        syncTabsInlineEndBlendFromContent(session)
      })
    }
  )

  onBeforeUnmount(() => {
    detachTabsInlineEndBlendContent(session)
  })

  return { tabsScrolledToInlineEnd }
}
