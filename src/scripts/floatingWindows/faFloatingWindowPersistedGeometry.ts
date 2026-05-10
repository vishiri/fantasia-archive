import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/** Rejects unreasonably large persisted sizes so corrupt JSON cannot explode layout work. */
export const FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX = 32_000

/**
 * Whether 'rect' is safe to apply as an initial window frame for 'layout' (finite, positive, min size).
 */
export function isUsableFaFloatingWindowPersistedRect (
  rect: I_faFloatingWindowPersistedRect | null | undefined,
  layout: I_FaFloatingWindowFrameLayout
): rect is I_faFloatingWindowPersistedRect {
  if (rect == null) {
    return false
  }
  const {
    x,
    y,
    width,
    height
  } = rect
  if (![x, y, width, height].every(Number.isFinite)) {
    return false
  }
  if (width <= 0 || height <= 0) {
    return false
  }
  if (width > FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX || height > FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX) {
    return false
  }
  if (width < layout.minWidthPx || height < layout.minHeightPx) {
    return false
  }
  return true
}

/**
 * Coerce unknown persisted 'frame' JSON to a stored rectangle or null when unusable.
 */
export function normalizePersistedRectForStorage (
  raw: unknown,
  layout: I_FaFloatingWindowFrameLayout = FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT
): I_faFloatingWindowPersistedRect | null {
  if (raw === null || raw === undefined) {
    return null
  }
  const rect = raw as I_faFloatingWindowPersistedRect
  if (isUsableFaFloatingWindowPersistedRect(rect, layout)) {
    return {
      height: rect.height,
      width: rect.width,
      x: rect.x,
      y: rect.y
    }
  }
  return null
}

/**
 * Whether 'raw' from disk represents the same rectangle as 'normalized' after cleanup.
 */
export function persistedFloatingWindowFramesAreEquivalent (
  raw: unknown,
  normalized: I_faFloatingWindowPersistedRect | null
): boolean {
  if (normalized === null) {
    return raw === null || raw === undefined
  }
  if (raw === null || raw === undefined || typeof raw !== 'object') {
    return false
  }
  const r = raw as Record<string, unknown>
  return (
    r.x === normalized.x &&
    r.y === normalized.y &&
    r.width === normalized.width &&
    r.height === normalized.height
  )
}
