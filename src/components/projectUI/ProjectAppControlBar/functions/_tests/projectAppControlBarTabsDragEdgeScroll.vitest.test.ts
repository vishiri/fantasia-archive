import { expect, test } from 'vitest'

import {
  PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
  PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
  resolveProjectAppControlBarTabsDragEdgeScrollIntensity,
  resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec
} from '../projectAppControlBarTabsDragEdgeScroll'

test('Test that resolveProjectAppControlBarTabsDragEdgeScrollIntensity ramps through the edge zone', () => {
  expect(resolveProjectAppControlBarTabsDragEdgeScrollIntensity(
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX
  )).toBe(0)
  expect(resolveProjectAppControlBarTabsDragEdgeScrollIntensity(
    0,
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX
  )).toBe(1)
  expect(resolveProjectAppControlBarTabsDragEdgeScrollIntensity(
    -10,
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX
  )).toBe(1)
  expect(resolveProjectAppControlBarTabsDragEdgeScrollIntensity(10, 0)).toBe(0)

  const mid = resolveProjectAppControlBarTabsDragEdgeScrollIntensity(
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX / 2,
    PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX
  )
  expect(mid).toBeGreaterThan(0)
  expect(mid).toBeLessThan(1)
})

test('Test that resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec scales left near left edge', () => {
  const nearEdge = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 110,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })
  const atEdge = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 100,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })

  expect(nearEdge).not.toBeNull()
  expect(atEdge).toBe(-PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC)
  expect(nearEdge as number).toBeGreaterThan(atEdge as number)
  expect(nearEdge as number).toBeLessThan(0)
})

test('Test that resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec scrolls right past right edge', () => {
  const velocity = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 320,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })
  expect(velocity).toBe(PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC)
})

test('Test that resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec returns null mid-strip or when blocked', () => {
  expect(resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 200,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })).toBeNull()

  expect(resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 110,
    scrollLeft: 0,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })).toBeNull()

  expect(resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 110,
    scrollLeft: 0,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 200
  })).toBeNull()
})

test('Test that overlapping edge zones follow the closer edge', () => {
  const closerToRight = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 80,
    contentLeft: 0,
    contentRight: 80,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 50,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 400
  })
  const closerToLeft = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 80,
    contentLeft: 0,
    contentRight: 80,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 28,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 400
  })
  const deadCenter = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 80,
    contentLeft: 0,
    contentRight: 80,
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 40,
    scrollLeft: 40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 400
  })

  expect(closerToRight).not.toBeNull()
  expect(closerToRight as number).toBeGreaterThan(0)
  expect(closerToLeft).not.toBeNull()
  expect(closerToLeft as number).toBeLessThan(0)
  expect(deadCenter).toBeNull()
})

test('Test that resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec scrolls rtl overflow both ways', () => {
  const towardInlineEnd = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    direction: 'rtl',
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 100,
    scrollLeft: 0,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })
  const towardInlineStart = resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec({
    clientWidth: 200,
    contentLeft: 100,
    contentRight: 300,
    direction: 'rtl',
    maxSpeedPxPerSec: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC,
    pointerClientX: 320,
    scrollLeft: -40,
    scrollSensitivityPx: PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX,
    scrollWidth: 800
  })
  expect(towardInlineEnd).toBe(-PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC)
  expect(towardInlineStart).toBe(PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC)
})
