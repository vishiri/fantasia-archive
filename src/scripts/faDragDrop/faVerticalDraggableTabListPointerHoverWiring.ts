import { ref } from 'vue'
import type { Ref } from 'vue'

const FA_VERTICAL_DRAGGABLE_TABS_TAB_SELECTOR = '.faVerticalDraggableTabs__tab'

type T_faVerticalDraggableTabListPointerHoverWiringInput = {
  dragIdDataAttribute: () => string
  draggingItemId: Ref<string | null>
  elementFromPoint: (x: number, y: number) => Element | null
  getRoot: () => HTMLElement | null
  getScroll: () => HTMLElement | null
  readDragItemId: (item: HTMLElement, dataAttribute: string) => string | null
  resolveTabIdUnderPoint: (args: {
    clientX: number
    clientY: number
    dragIdDataAttribute: string
    elementFromPoint: (x: number, y: number) => Element | null
    readDragItemId: (item: HTMLElement, dataAttribute: string) => string | null
    root: Element
    tabSelector: string
  }) => string | null
  sortableAnimationMs: number
}

type T_faVerticalDraggableTabListPointerHoverSyncState = {
  lastPointerClientX: number
  lastPointerClientY: number
  pointerHoverItemId: Ref<string | null>
}

function clearPointerHover (pointerHoverItemId: Ref<string | null>): void {
  pointerHoverItemId.value = null
}

function syncPointerHoverFromTarget (
  input: T_faVerticalDraggableTabListPointerHoverWiringInput,
  pointerHoverItemId: Ref<string | null>,
  target: EventTarget | null
): void {
  if (input.draggingItemId.value !== null) {
    return
  }
  if (!(target instanceof Element)) {
    clearPointerHover(pointerHoverItemId)
    return
  }
  const tab = target.closest(FA_VERTICAL_DRAGGABLE_TABS_TAB_SELECTOR)
  if (!(tab instanceof HTMLElement)) {
    clearPointerHover(pointerHoverItemId)
    return
  }
  const rootEl = input.getRoot()
  if (rootEl === null || !rootEl.contains(tab)) {
    clearPointerHover(pointerHoverItemId)
    return
  }
  pointerHoverItemId.value = input.readDragItemId(tab, input.dragIdDataAttribute())
}

function syncPointerHoverFromLastPoint (
  input: T_faVerticalDraggableTabListPointerHoverWiringInput,
  state: T_faVerticalDraggableTabListPointerHoverSyncState
): void {
  const rootEl = input.getRoot()
  if (rootEl === null || input.draggingItemId.value !== null) {
    clearPointerHover(state.pointerHoverItemId)
    return
  }
  state.pointerHoverItemId.value = input.resolveTabIdUnderPoint({
    clientX: state.lastPointerClientX,
    clientY: state.lastPointerClientY,
    dragIdDataAttribute: input.dragIdDataAttribute(),
    elementFromPoint: input.elementFromPoint,
    readDragItemId: input.readDragItemId,
    root: rootEl,
    tabSelector: FA_VERTICAL_DRAGGABLE_TABS_TAB_SELECTOR
  })
}

/**
 * JS pointer-hover for vertical tabs — Sortable reorder leaves sticky CSS :hover on the wrong row.
 */
export function createFaVerticalDraggableTabListPointerHoverWiring (
  input: T_faVerticalDraggableTabListPointerHoverWiringInput
) {
  const pointerHoverItemId = ref<string | null>(null)
  const state: T_faVerticalDraggableTabListPointerHoverSyncState = {
    lastPointerClientX: 0,
    lastPointerClientY: 0,
    pointerHoverItemId
  }
  let pointerHoverResyncTimeoutId: number | null = null

  function onTabListPointerMove (event: PointerEvent): void {
    state.lastPointerClientX = event.clientX
    state.lastPointerClientY = event.clientY
    syncPointerHoverFromTarget(input, pointerHoverItemId, event.target)
  }

  function onTabListPointerLeave (event: PointerEvent): void {
    const scrollEl = input.getScroll()
    const related = event.relatedTarget
    if (
      scrollEl !== null &&
      related instanceof Node &&
      scrollEl.contains(related)
    ) {
      return
    }
    clearPointerHover(pointerHoverItemId)
  }

  function cancelPointerHoverResync (): void {
    if (pointerHoverResyncTimeoutId === null) {
      return
    }
    window.clearTimeout(pointerHoverResyncTimeoutId)
    pointerHoverResyncTimeoutId = null
  }

  function schedulePointerHoverResyncAfterAnimation (): void {
    cancelPointerHoverResync()
    clearPointerHover(pointerHoverItemId)
    pointerHoverResyncTimeoutId = window.setTimeout(() => {
      pointerHoverResyncTimeoutId = null
      syncPointerHoverFromLastPoint(input, state)
    }, input.sortableAnimationMs)
  }

  const clearPointerHoverBinding = (): void => {
    clearPointerHover(pointerHoverItemId)
  }

  return {
    cancelPointerHoverResync,
    clearPointerHover: clearPointerHoverBinding,
    onTabListPointerLeave,
    onTabListPointerMove,
    pointerHoverItemId,
    schedulePointerHoverResyncAfterAnimation
  }
}
