import { expect, test } from 'vitest'

import {
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
  type I_FaFloatingWindowFrameLayout
} from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import {
  clampFaFloatingWindowFrameToViewport,
  clampFaFloatingWindowResizeToViewport,
  computeFaFloatingWindowResizeFrame
} from 'app/src/scripts/floatingWindows/faFloatingWindowResizeGeometry'

/** Same margins as production; smaller mins so resize math in these tests is not dominated by frame minimums. */
const layout: I_FaFloatingWindowFrameLayout = {
  ...FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
  minHeightPx: 200,
  minWidthPx: 200
}
const viewport = {
  innerWidth: 1000,
  innerHeight: 800
}
const origin = {
  x: 100,
  y: 100,
  w: 400,
  h: 300
}
const originWide = {
  x: 100,
  y: 100,
  w: 500,
  h: 300
}
const originTall = {
  x: 100,
  y: 100,
  w: 400,
  h: 350
}
const originNw = {
  x: 100,
  y: 100,
  w: 450,
  h: 350
}

/**
 * computeFaFloatingWindowResizeFrame
 * East edge grows width by horizontal delta.
 */
test('Test that computeFaFloatingWindowResizeFrame expands width from the east edge', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'e', origin, 50, 0)
  expect(next).toEqual({
    x: 100,
    y: 100,
    w: 450,
    h: 300
  })
})

/**
 * computeFaFloatingWindowResizeFrame
 * West edge moves left and narrows when dragging inward (positive deltaX).
 */
test('Test that computeFaFloatingWindowResizeFrame adjusts x and width from the west edge', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'w', originWide, 50, 0)
  expect(next).toEqual({
    x: 150,
    y: 100,
    w: 450,
    h: 300
  })
})

/**
 * computeFaFloatingWindowResizeFrame
 * South edge grows height by vertical delta.
 */
test('Test that computeFaFloatingWindowResizeFrame expands height from the south edge', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 's', origin, 0, 40)
  expect(next).toEqual({
    x: 100,
    y: 100,
    w: 400,
    h: 340
  })
})

/**
 * computeFaFloatingWindowResizeFrame
 * North edge moves top and changes height.
 */
test('Test that computeFaFloatingWindowResizeFrame adjusts y and height from the north edge', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'n', originTall, 0, 30)
  expect(next).toEqual({
    x: 100,
    y: 130,
    w: 400,
    h: 320
  })
})

/**
 * computeFaFloatingWindowResizeFrame
 * South-east corner combines east and south behavior with fixed north-west.
 */
test('Test that computeFaFloatingWindowResizeFrame resizes from the south-east corner', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'se', origin, 20, 25)
  expect(next).toEqual({
    x: 100,
    y: 100,
    w: 420,
    h: 325
  })
})

/**
 * computeFaFloatingWindowResizeFrame
 * North-west corner keeps the opposite corner anchored.
 */
test('Test that computeFaFloatingWindowResizeFrame resizes from the north-west corner', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'nw', originNw, 40, 30)
  expect(next).toEqual({
    x: 140,
    y: 130,
    w: 410,
    h: 320
  })
})

/**
 * computeFaFloatingWindowResizeFrame
 * North-east corner keeps south-west fixed.
 */
test('Test that computeFaFloatingWindowResizeFrame resizes from the north-east corner', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'ne', origin, 25, 20)
  expect(next.x).toBe(100)
  expect(next.y + next.h).toBe(origin.y + origin.h)
  expect(next.w).toBe(425)
})

/**
 * computeFaFloatingWindowResizeFrame
 * South-west corner keeps north-east fixed.
 */
test('Test that computeFaFloatingWindowResizeFrame resizes from the south-west corner', () => {
  const next = computeFaFloatingWindowResizeFrame(layout, viewport, 'sw', origin, -15, 35)
  expect(next).toEqual({
    x: 85,
    y: 100,
    w: 415,
    h: 335
  })
})

/**
 * clampFaFloatingWindowResizeToViewport
 * Preserves the right edge when clamping west resize so the window does not drift horizontally.
 */
test('Test that clampFaFloatingWindowResizeToViewport keeps x plus w constant for the west handle', () => {
  const o = {
    x: 100,
    y: 100,
    w: 520,
    h: 300
  }
  const anchorRight = o.x + o.w
  const next = clampFaFloatingWindowResizeToViewport(layout, viewport, 'w', o, {
    h: o.h,
    w: 250
  })
  expect(next.x + next.w).toBe(anchorRight)
  expect(next.y).toBe(o.y)
})

/**
 * clampFaFloatingWindowResizeToViewport
 * Preserves the bottom edge when clamping north resize.
 */
test('Test that clampFaFloatingWindowResizeToViewport keeps y plus h constant for the north handle', () => {
  const o = {
    x: 100,
    y: 100,
    w: 400,
    h: 380
  }
  const anchorBottom = o.y + o.h
  const next = clampFaFloatingWindowResizeToViewport(layout, viewport, 'n', o, {
    h: 200,
    w: o.w
  })
  expect(next.y + next.h).toBe(anchorBottom)
  expect(next.x).toBe(o.x)
})

/**
 * clampFaFloatingWindowFrameToViewport
 * Clamps size and position when the frame would exceed the viewport.
 */
test('Test that clampFaFloatingWindowFrameToViewport pulls an oversized rectangle inward', () => {
  const next = clampFaFloatingWindowFrameToViewport(layout, viewport, {
    x: 100,
    y: 100,
    w: 2000,
    h: 2000
  })
  expect(next.w).toBeLessThanOrEqual(viewport.innerWidth)
  expect(next.x).toBeGreaterThanOrEqual(layout.marginLeftPx)
  expect(next.x + next.w).toBeLessThanOrEqual(viewport.innerWidth - layout.marginRightPx)
  expect(next.y).toBeGreaterThanOrEqual(layout.marginTopPx)
  expect(next.y + next.h).toBeLessThanOrEqual(viewport.innerHeight - layout.marginBottomPx)
})
