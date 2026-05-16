/** @vitest-environment jsdom */
/* eslint-disable vue/one-component-per-file -- colocated defineComponent harness for composable */
import { defineComponent, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => {
  return {
    runFaActionMock: vi.fn()
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => {
  return {
    runFaAction: runFaActionMock
  }
})

import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { useWindowProjectStylingFramePersist } from '../useWindowProjectStylingFramePersist'

let pinia: ReturnType<typeof createPinia>

beforeEach(() => {
  vi.useFakeTimers()
  pinia = createPinia()
  setActivePinia(pinia)
  runFaActionMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

test('useWindowProjectStylingFramePersist debounces frame writes when the window is open', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const x = ref(0)
  const y = ref(1)
  const w = ref(220)
  const h = ref(180)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  x.value = 44
  await nextTick()
  vi.advanceTimersByTime(279)
  expect(persistSpy).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  await flushPromises()
  expect(persistSpy).toHaveBeenCalledTimes(1)
  expect(persistSpy).toHaveBeenCalledWith({
    frame: {
      height: 180,
      width: 220,
      x: 44,
      y: 1
    }
  })
})

test('useWindowProjectStylingFramePersist ignores frame motion while the window is closed', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const x = ref(0)
  const y = ref(0)
  const w = ref(200)
  const h = ref(200)
  const windowModel = ref(false)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  x.value = 99
  await nextTick()
  vi.advanceTimersByTime(500)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectStylingFramePersist skips persist flush when transitioning closed with empty persist path', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const x = ref(0)
  const y = ref(0)
  const w = ref(200)
  const h = ref(200)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(0)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectStylingFramePersist reports action failures from silent persist', async () => {
  const store = S_FaProjectStyling()
  vi.spyOn(store, 'persistProjectStylingPartialSilent').mockRejectedValue(new Error('disk full'))

  const x = ref(0)
  const y = ref(0)
  const w = ref(200)
  const h = ref(200)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  x.value = 3
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectStylingSaveFailure', {
    message: 'disk full'
  })
})

test('useWindowProjectStylingFramePersist skips debounced persist when the window closes first', async () => {
  const store = S_FaProjectStyling()
  const persistSpy = vi
    .spyOn(store, 'persistProjectStylingPartialSilent')
    .mockResolvedValue(undefined)

  const x = ref(0)
  const y = ref(0)
  const w = ref(200)
  const h = ref(200)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  x.value = 7
  await nextTick()
  windowModel.value = false
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(persistSpy).not.toHaveBeenCalled()
})

test('useWindowProjectStylingFramePersist stringifies non-Error rejections', async () => {
  const store = S_FaProjectStyling()
  vi.spyOn(store, 'persistProjectStylingPartialSilent').mockRejectedValue('oops')

  const x = ref(0)
  const y = ref(0)
  const w = ref(200)
  const h = ref(200)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  x.value = 3
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectStylingSaveFailure', {
    message: 'oops'
  })
})

test('useWindowProjectStylingFramePersist coerces null rejections to a string message', async () => {
  const store = S_FaProjectStyling()
  vi.spyOn(store, 'persistProjectStylingPartialSilent').mockRejectedValue(null)

  const x = ref(0)
  const y = ref(0)
  const w = ref(200)
  const h = ref(200)
  const windowModel = ref(true)

  const Harness = defineComponent({
    setup () {
      useWindowProjectStylingFramePersist({
        h,
        windowModel,
        w,
        x,
        y
      })
      return () => null
    }
  })

  mount(Harness, { global: { plugins: [pinia] } })

  x.value = 1
  await nextTick()
  vi.advanceTimersByTime(280)
  await flushPromises()
  expect(runFaActionMock).toHaveBeenCalledWith('reportProjectStylingSaveFailure', {
    message: 'null'
  })
})
