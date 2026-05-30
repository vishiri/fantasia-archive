import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

interface I_faFloatingWindowPersistedLayoutMinSize {
  minHeightPx: number
  minWidthPx: number
}

export function createFaFloatingWindowPersistedGeometry (deps: {
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT: I_faFloatingWindowPersistedLayoutMinSize
  FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX: number
}): {
    FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX: number
    isUsableFaFloatingWindowPersistedRect: (
      rect: I_faFloatingWindowPersistedRect | null | undefined,
      layout: I_faFloatingWindowPersistedLayoutMinSize
    ) => rect is I_faFloatingWindowPersistedRect
    normalizePersistedRectForStorage: (
      raw: unknown,
      layout?: I_faFloatingWindowPersistedLayoutMinSize
    ) => I_faFloatingWindowPersistedRect | null
    persistedFloatingWindowFramesAreEquivalent: (
      raw: unknown,
      normalized: I_faFloatingWindowPersistedRect | null
    ) => boolean
  } {
  const isUsableFaFloatingWindowPersistedRect = (
    rect: I_faFloatingWindowPersistedRect | null | undefined,
    layout: I_faFloatingWindowPersistedLayoutMinSize
  ): rect is I_faFloatingWindowPersistedRect => {
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
    if (width > deps.FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX || height > deps.FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX) {
      return false
    }
    if (width < layout.minWidthPx || height < layout.minHeightPx) {
      return false
    }
    return true
  }

  const normalizePersistedRectForStorage = (
    raw: unknown,
    layout: I_faFloatingWindowPersistedLayoutMinSize = deps.FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT
  ): I_faFloatingWindowPersistedRect | null => {
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

  const persistedFloatingWindowFramesAreEquivalent = (
    raw: unknown,
    normalized: I_faFloatingWindowPersistedRect | null
  ): boolean => {
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

  return {
    FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX: deps.FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX,
    isUsableFaFloatingWindowPersistedRect,
    normalizePersistedRectForStorage,
    persistedFloatingWindowFramesAreEquivalent
  }
}
