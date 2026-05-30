/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- composable harness */
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useFaFloatingWindowFramePersist } from '../useFaFloatingWindowFramePersist_manager'

const runFaActionMock = vi.hoisted(() => vi.fn())

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => ({
  runFaAction: runFaActionMock
}))

beforeEach(() => {
  vi.useFakeTimers()
  runFaActionMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * useFaFloatingWindowFramePersist
 * Debounces frame persistence while the window stays open.
 */
test('Test that useFaFloatingWindowFramePersist debounces persistFrame calls', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const x = ref(0)
  const y = ref(0)
  const w = ref(100)
  const h = ref(100)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowFramePersist({
        failureActionId: 'reportAppStylingPersistFailure',
        h,
        persistFrame,
        w,
        windowModel,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness)
  x.value = 10
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(persistFrame).toHaveBeenCalledOnce()
})

/**
 * useFaFloatingWindowFramePersist
 * Reports failures through the configured action id.
 */
test('Test that useFaFloatingWindowFramePersist reports persist failures', async () => {
  const persistFrame = vi.fn(async () => {
    throw new Error('persist failed')
  })
  const windowModel = ref(true)
  const x = ref(0)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowFramePersist({
        failureActionId: 'reportAppStylingPersistFailure',
        h: ref(1),
        persistFrame,
        w: ref(1),
        windowModel,
        x,
        y: ref(1)
      })
      return () => null
    }
  })

  mount(Harness)
  x.value = 5
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportAppStylingPersistFailure', { message: 'persist failed' })
})

/**
 * useFaFloatingWindowFramePersist
 * Stringifies non-Error rejections before reporting.
 */
test('Test that useFaFloatingWindowFramePersist stringifies non-Error rejections', async () => {
  const persistFrame = vi.fn(async () => {
    // eslint-disable-next-line no-throw-literal -- exercises non-Error branch
    throw 'raw failure'
  })
  const windowModel = ref(true)
  const x = ref(0)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowFramePersist({
        failureActionId: 'reportAppStylingPersistFailure',
        h: ref(1),
        persistFrame,
        w: ref(1),
        windowModel,
        x,
        y: ref(1)
      })
      return () => null
    }
  })

  mount(Harness)
  x.value = 5
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportAppStylingPersistFailure', { message: 'raw failure' })
})

/**
 * useFaFloatingWindowFramePersist
 * Skips scheduled writes while the window is closed.
 */
test('Test that useFaFloatingWindowFramePersist ignores frame motion while closed', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const windowModel = ref(false)
  const x = ref(0)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowFramePersist({
        failureActionId: 'reportAppStylingPersistFailure',
        h: ref(1),
        persistFrame,
        w: ref(1),
        windowModel,
        x,
        y: ref(1)
      })
      return () => null
    }
  })

  mount(Harness)
  x.value = 9
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(persistFrame).not.toHaveBeenCalled()
})

/**
 * useFaFloatingWindowFramePersist
 * Closing the window flushes debounced work without persisting after the model is already false.
 */
test('Test that useFaFloatingWindowFramePersist does not persist after the window closes', async () => {
  const persistFrame = vi.fn(async () => undefined)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useFaFloatingWindowFramePersist({
        failureActionId: 'reportAppStylingPersistFailure',
        h: ref(1),
        persistFrame,
        w: ref(1),
        windowModel,
        x: ref(0),
        y: ref(1)
      })
      return () => null
    }
  })

  mount(Harness)
  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(0)
  await flushPromises()
  expect(persistFrame).not.toHaveBeenCalled()
})
