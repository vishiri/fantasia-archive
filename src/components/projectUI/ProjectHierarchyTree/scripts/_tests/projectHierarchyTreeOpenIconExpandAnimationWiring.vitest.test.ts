import { expect, test, vi } from 'vitest'
import { ref } from 'vue'

import { createProjectHierarchyTreeOpenIconExpandAnimationWiring } from '../projectHierarchyTreeOpenIconExpandAnimationWiring'

test('Test that open icon expand animation wiring schedules and clears pending node ids', () => {
  vi.useFakeTimers()
  const openNodeIds = ref(new Set<string>())
  const clearTimeoutSpy = vi.fn((timeoutId: number) => {
    clearTimeout(timeoutId)
  })
  const unmountControl = {
    run: () => undefined as void
  }
  const wiring = createProjectHierarchyTreeOpenIconExpandAnimationWiring({
    clearTimeout: clearTimeoutSpy,
    onUnmounted: (hook) => {
      unmountControl.run = hook
    },
    openIconRotateTransitionDurationMs: 300,
    openNodeIds,
    ref,
    setTimeout: (handler, delayMs) => {
      return window.setTimeout(handler, delayMs)
    }
  })
  wiring.scheduleOpenIconExpandAnimation('group-1')
  expect(wiring.isOpenIconExpandAnimationPending('group-1')).toBe(true)
  expect(wiring.isProjectHierarchyTreeOpenIconExpandedForOpenIcon('group-1', false)).toBe(false)
  openNodeIds.value = new Set(['group-1'])
  expect(wiring.isProjectHierarchyTreeOpenIconExpandedForOpenIcon('group-1', false)).toBe(true)
  wiring.scheduleOpenIconExpandAnimation('group-1')
  expect(clearTimeoutSpy).toHaveBeenCalled()
  vi.advanceTimersByTime(300)
  expect(wiring.isOpenIconExpandAnimationPending('group-1')).toBe(false)
  wiring.scheduleOpenIconExpandAnimation('group-2')
  unmountControl.run()
  expect(wiring.isOpenIconExpandAnimationPending('group-2')).toBe(false)
  vi.useRealTimers()
})
