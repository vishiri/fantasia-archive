import { expect, test } from 'vitest'

import {
  resolveProjectAppControlBarTabsHorizontalWheelDelta,
  resolveProjectAppControlBarTabsWheelScrollLeft
} from '../projectAppControlBarTabsWheelScroll'

test('Test that resolveProjectAppControlBarTabsHorizontalWheelDelta prefers larger axis', () => {
  expect(resolveProjectAppControlBarTabsHorizontalWheelDelta({
    deltaX: 40,
    deltaY: 10
  })).toBe(40)
  expect(resolveProjectAppControlBarTabsHorizontalWheelDelta({
    deltaX: 5,
    deltaY: -30
  })).toBe(-30)
})

test('Test that resolveProjectAppControlBarTabsWheelScrollLeft moves within overflow bounds', () => {
  expect(resolveProjectAppControlBarTabsWheelScrollLeft({
    clientWidth: 100,
    delta: 25,
    scrollLeft: 10,
    scrollWidth: 300
  })).toBe(35)
  expect(resolveProjectAppControlBarTabsWheelScrollLeft({
    clientWidth: 100,
    delta: 50,
    scrollLeft: 180,
    scrollWidth: 200
  })).toBe(100)
})

test('Test that resolveProjectAppControlBarTabsWheelScrollLeft returns null when stuck or no overflow', () => {
  expect(resolveProjectAppControlBarTabsWheelScrollLeft({
    clientWidth: 200,
    delta: 10,
    scrollLeft: 0,
    scrollWidth: 200
  })).toBeNull()
  expect(resolveProjectAppControlBarTabsWheelScrollLeft({
    clientWidth: 100,
    delta: 0,
    scrollLeft: 20,
    scrollWidth: 300
  })).toBeNull()
  expect(resolveProjectAppControlBarTabsWheelScrollLeft({
    clientWidth: 100,
    delta: -10,
    scrollLeft: 0,
    scrollWidth: 300
  })).toBeNull()
})
