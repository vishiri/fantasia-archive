import { expect, test } from 'vitest'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import {
  FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX,
  isUsableFaFloatingWindowPersistedRect,
  normalizePersistedRectForStorage,
  persistedFloatingWindowFramesAreEquivalent
} from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry'

const layout: I_FaFloatingWindowFrameLayout = {
  widthFrac: 0.9,
  heightFrac: 0.85,
  minWidthPx: 200,
  minHeightPx: 200,
  marginTopPx: 36,
  marginRightPx: 0,
  marginBottomPx: 0,
  marginLeftPx: 0
}

/**
 * isUsableFaFloatingWindowPersistedRect
 * Accepts finite rects that meet layout minimums and stay under the max edge guard.
 */
test('Test that isUsableFaFloatingWindowPersistedRect returns true for a normal rectangle', () => {
  expect(isUsableFaFloatingWindowPersistedRect({
    height: 400,
    width: 400,
    x: 12,
    y: 34
  }, layout)).toBe(true)
})

/**
 * isUsableFaFloatingWindowPersistedRect
 * Rejects null and undefined.
 */
test('Test that isUsableFaFloatingWindowPersistedRect returns false for nullish rects', () => {
  expect(isUsableFaFloatingWindowPersistedRect(null, layout)).toBe(false)
  expect(isUsableFaFloatingWindowPersistedRect(undefined, layout)).toBe(false)
})

/**
 * isUsableFaFloatingWindowPersistedRect
 * Rejects non-finite components and non-positive dimensions.
 */
test('Test that isUsableFaFloatingWindowPersistedRect returns false for invalid numbers', () => {
  expect(isUsableFaFloatingWindowPersistedRect({
    height: 400,
    width: Number.NaN,
    x: 0,
    y: 0
  }, layout)).toBe(false)
  expect(isUsableFaFloatingWindowPersistedRect({
    height: 0,
    width: 400,
    x: 0,
    y: 0
  }, layout)).toBe(false)
})

/**
 * isUsableFaFloatingWindowPersistedRect
 * Rejects widths or heights below layout minimums.
 */
test('Test that isUsableFaFloatingWindowPersistedRect returns false when below layout minimums', () => {
  expect(isUsableFaFloatingWindowPersistedRect({
    height: 400,
    width: 199,
    x: 0,
    y: 0
  }, layout)).toBe(false)
})

/**
 * isUsableFaFloatingWindowPersistedRect
 * Rejects absurdly large edges so corrupt persistence cannot pass.
 */
test('Test that isUsableFaFloatingWindowPersistedRect returns false when an edge exceeds the cap', () => {
  expect(isUsableFaFloatingWindowPersistedRect({
    height: 400,
    width: FA_FLOATING_WINDOW_PERSISTED_RECT_MAX_EDGE_PX + 1,
    x: 0,
    y: 0
  }, layout)).toBe(false)
})

test('normalizePersistedRectForStorage returns null for nullish raw', () => {
  expect(normalizePersistedRectForStorage(null, layout)).toBeNull()
  expect(normalizePersistedRectForStorage(undefined, layout)).toBeNull()
})

test('normalizePersistedRectForStorage returns null for unusable raw objects', () => {
  expect(normalizePersistedRectForStorage({ not: 'a-rect' }, layout)).toBeNull()
})

test('normalizePersistedRectForStorage returns a rectangle when input is usable', () => {
  const rect = {
    height: 400,
    width: 400,
    x: 10,
    y: 20
  }
  expect(normalizePersistedRectForStorage(rect, layout)).toEqual(rect)
})

test('persistedFloatingWindowFramesAreEquivalent compares raw to normalized rects', () => {
  const norm = {
    height: 400,
    width: 400,
    x: 0,
    y: 0
  }
  expect(persistedFloatingWindowFramesAreEquivalent(null, null)).toBe(true)
  expect(persistedFloatingWindowFramesAreEquivalent(undefined, null)).toBe(true)
  expect(persistedFloatingWindowFramesAreEquivalent(norm, null)).toBe(false)
  expect(persistedFloatingWindowFramesAreEquivalent(null, norm)).toBe(false)
  expect(persistedFloatingWindowFramesAreEquivalent(norm, norm)).toBe(true)
  expect(
    persistedFloatingWindowFramesAreEquivalent({
      height: 399,
      width: 400,
      x: 0,
      y: 0
    }, norm)
  ).toBe(false)
  expect(persistedFloatingWindowFramesAreEquivalent('x', norm)).toBe(false)
})
