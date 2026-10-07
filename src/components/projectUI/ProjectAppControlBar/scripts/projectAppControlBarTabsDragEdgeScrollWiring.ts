import {
  PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
  PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
  resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec
} from '../functions/projectAppControlBarTabsDragEdgeScroll'
import { resolveProjectAppControlBarTabsScrollLeftBounds } from '../functions/projectAppControlBarTabsWheelScroll'
import { PROJECT_APP_CONTROL_BAR_TABS_CONTENT_SELECTOR } from './projectAppControlBarTabsWheelScrollWiring'

/** Cap one frame's dt so a tab-blur spike does not jump scroll. */
const PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_FRAME_SEC = 0.05

type T_projectAppControlBarTabsDragEdgeScrollSession = {
  content: HTMLElement
  hasPointerSample: boolean
  lastFrameMs: number
  onPointerMove: (event: PointerEvent) => void
  pointerClientX: number
  rafId: number
  scrollCarryPx: number
}

let activeDragEdgeScrollSession: T_projectAppControlBarTabsDragEdgeScrollSession | null = null

function applyProjectAppControlBarTabsDragEdgeScrollFrame (
  session: T_projectAppControlBarTabsDragEdgeScrollSession,
  nowMs: number
): void {
  const elapsedSec = Math.min(
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_FRAME_SEC,
    Math.max(0, (nowMs - session.lastFrameMs) / 1000)
  )
  session.lastFrameMs = nowMs

  if (!session.hasPointerSample || elapsedSec === 0) {
    return
  }

  const rect = session.content.getBoundingClientRect()
  const direction = getComputedStyle(session.content).direction === 'rtl' ? 'rtl' : 'ltr'
  const velocityPxPerSec = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: session.content.clientWidth,
    contentLeft: rect.left,
    contentRight: rect.right,
    direction,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: session.pointerClientX,
    scrollLeft: session.content.scrollLeft,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: session.content.scrollWidth
  })
  if (velocityPxPerSec === null) {
    session.scrollCarryPx = 0
    return
  }

  session.scrollCarryPx += velocityPxPerSec * elapsedSec
  const wholeDeltaPx = session.scrollCarryPx < 0
    ? Math.ceil(session.scrollCarryPx)
    : Math.floor(session.scrollCarryPx)
  if (wholeDeltaPx === 0) {
    return
  }

  session.scrollCarryPx -= wholeDeltaPx
  const bounds = resolveProjectAppControlBarTabsScrollLeftBounds({
    clientWidth: session.content.clientWidth,
    direction,
    scrollWidth: session.content.scrollWidth
  })
  if (bounds === null) {
    return
  }
  const nextScrollLeft = Math.min(
    bounds.maxScrollLeft,
    Math.max(bounds.minScrollLeft, session.content.scrollLeft + wholeDeltaPx)
  )
  session.content.scrollLeft = nextScrollLeft
}

function scheduleProjectAppControlBarTabsDragEdgeScrollFrame (
  session: T_projectAppControlBarTabsDragEdgeScrollSession
): void {
  session.rafId = requestAnimationFrame((nowMs) => {
    if (activeDragEdgeScrollSession !== session) {
      return
    }
    applyProjectAppControlBarTabsDragEdgeScrollFrame(session, nowMs)
    scheduleProjectAppControlBarTabsDragEdgeScrollFrame(session)
  })
}

/**
 * Starts edge auto-scroll for overflow q-tabs while a document tab is dragged.
 * Quasar content uses overflow:hidden, so Sortable AutoScroll cannot detect it.
 */
export function startProjectAppControlBarTabsDragEdgeScroll (
  tabsRoot: HTMLElement | null | undefined,
  initialPointerClientX?: number
): void {
  stopProjectAppControlBarTabsDragEdgeScroll()
  if (tabsRoot === null || tabsRoot === undefined) {
    return
  }

  const content = tabsRoot.querySelector(PROJECT_APP_CONTROL_BAR_TABS_CONTENT_SELECTOR)
  if (!(content instanceof HTMLElement)) {
    return
  }

  const session: T_projectAppControlBarTabsDragEdgeScrollSession = {
    content,
    hasPointerSample: initialPointerClientX !== undefined,
    lastFrameMs: performance.now(),
    onPointerMove: (event: PointerEvent) => {
      session.pointerClientX = event.clientX
      session.hasPointerSample = true
    },
    pointerClientX: initialPointerClientX ?? 0,
    rafId: 0,
    scrollCarryPx: 0
  }

  document.addEventListener('pointermove', session.onPointerMove)
  activeDragEdgeScrollSession = session
  scheduleProjectAppControlBarTabsDragEdgeScrollFrame(session)
}

/**
 * Stops drag edge auto-scroll and clears document pointer listeners.
 */
export function stopProjectAppControlBarTabsDragEdgeScroll (): void {
  const session = activeDragEdgeScrollSession
  if (session === null) {
    return
  }

  cancelAnimationFrame(session.rafId)
  document.removeEventListener('pointermove', session.onPointerMove)
  activeDragEdgeScrollSession = null
}
